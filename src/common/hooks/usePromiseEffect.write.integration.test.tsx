import React, { FunctionComponent, useState } from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import usePromiseEffect from 'common/hooks/usePromiseEffect'
import ApiClient from 'http/ApiClient'
import { AuthenticationService } from 'auth/Auth'

type ResolveBody = (body: string) => void

let apiClient: ApiClient
let resolveRequests: ResolveBody[]

const SaveForm: FunctionComponent<{ client: ApiClient }> = ({ client }) => {
  const [, , runWrite] = usePromiseEffect()
  const [savedValue, setSavedValue] = useState('nothing saved')
  const [failure, setFailure] = useState('no failure')

  const save = (value: string): void => {
    runWrite((isStale) =>
      client.postJson<{ value: string }>('/values', { value }).then(
        (response) => {
          if (!isStale()) {
            setSavedValue(response.value)
          }
        },
        (error) => {
          if (!isStale()) {
            setFailure((error as Error).name)
          }
        },
      ),
    )
  }

  return (
    <>
      <button onClick={() => save('first')}>Save first</button>
      <button onClick={() => save('second')}>Save second</button>
      <p>Saved: {savedValue}</p>
      <p>Failure: {failure}</p>
    </>
  )
}

function startedRequests(): RequestInit[] {
  return fetchMock.mock.calls.map(([, options]) => options as RequestInit)
}

beforeEach(() => {
  fetchMock.resetMocks()
  resolveRequests = []
  fetchMock.mockResponse(
    () =>
      new Promise<string>((resolve) => {
        resolveRequests.push(resolve)
      }),
  )
  const auth = {
    getAccessToken: jest.fn().mockResolvedValue('token'),
    isAuthenticated: jest.fn().mockReturnValue(true),
  } as unknown as jest.Mocked<AuthenticationService>
  apiClient = new ApiClient(auth, { captureException: jest.fn() })
})

async function startBothWrites(): Promise<void> {
  render(<SaveForm client={apiClient} />)
  await userEvent.click(screen.getByRole('button', { name: 'Save first' }))
  await act(async () => {
    await Promise.resolve()
  })
  await userEvent.click(screen.getByRole('button', { name: 'Save second' }))
  await act(async () => {
    await Promise.resolve()
  })
  expect(resolveRequests).toHaveLength(2)
}

test('A superseding write does not attach an abort signal to the dispatched write', async () => {
  await startBothWrites()

  startedRequests().forEach((options) => {
    expect(options.signal).toBeUndefined()
  })
})

test('A superseding write does not abort the first write in flight', async () => {
  await startBothWrites()

  await act(async () => {
    resolveRequests[1](JSON.stringify({ value: 'second' }))
    resolveRequests[0](JSON.stringify({ value: 'first' }))
    await Promise.resolve()
  })

  expect(await screen.findByText('Failure: no failure')).toBeVisible()
})

test('A superseded write cannot overwrite the current UI state', async () => {
  await startBothWrites()

  await act(async () => {
    resolveRequests[1](JSON.stringify({ value: 'second' }))
    await Promise.resolve()
  })
  expect(await screen.findByText('Saved: second')).toBeVisible()

  await act(async () => {
    resolveRequests[0](JSON.stringify({ value: 'first' }))
    await Promise.resolve()
  })

  expect(await screen.findByText('Saved: second')).toBeVisible()
  expect(screen.queryByText('Saved: first')).not.toBeInTheDocument()
})

test('The current write updates the UI state', async () => {
  await startBothWrites()

  await act(async () => {
    resolveRequests[0](JSON.stringify({ value: 'first' }))
    resolveRequests[1](JSON.stringify({ value: 'second' }))
    await Promise.resolve()
  })

  expect(await screen.findByText('Saved: second')).toBeVisible()
})
