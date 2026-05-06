import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Promise from 'bluebird'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import SignService from 'signs/application/SignService'
import Signs from 'signs/ui/search/Signs'
import { OrderedSignFactory, signFactory } from 'test-support/sign-fixtures'

jest.mock('signs/application/SignService')

const signs = signFactory.buildList(2)
const orderedSigns = OrderedSignFactory.build()
const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()
let session: MemorySession

describe('Searching for word', () => {
  beforeEach(() => {
    session = new MemorySession(['read:words'])
    signService.search.mockReturnValue(Promise.resolve(signs))
    signService.findSignsByOrder.mockReturnValue(Promise.resolve(orderedSigns))
  })
  it('displays result on successfull query', async () => {
    const value = signs[1].values[0]
    await renderSigns(
      `/signs?sign=${value.value}&subIndex=1&value=${value.value}`,
    )
    expect(
      screen.getAllByText(new RegExp(`${value.value}`))[0],
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Query')).toHaveValue(value.value)
  })
  it('displays empty search if no query', async () => {
    await renderSigns('/signs')
    expect(screen.getByLabelText('Query')).toHaveValue('')
  })

  it('does not refetch on rerender when query is unchanged', async () => {
    const value = signs[1].values[0]
    const path = `/signs?sign=${value.value}&subIndex=1&value=${value.value}`
    const view = render(
      <MemoryRouter initialEntries={[path]}>
        <SessionContext.Provider value={session}>
          <Signs signService={signService} />
        </SessionContext.Provider>
      </MemoryRouter>,
    )

    await screen.findByLabelText('Query')
    await waitForSignsRequestsToSettle()
    const callsAfterInitialRender = signService.search.mock.calls.length

    view.rerender(
      <MemoryRouter initialEntries={[path]}>
        <SessionContext.Provider value={session}>
          <Signs signService={signService} />
        </SessionContext.Provider>
      </MemoryRouter>,
    )

    expect(signService.search.mock.calls.length).toBe(callsAfterInitialRender)
  })
})

it('Displays a message if user is not logged in', async () => {
  session = new MemorySession([])
  await renderSigns('/signs', false)
  expect(screen.getByText('Please log in to search for Signs.')).toBeVisible()
})

async function renderSigns(path: string, hasAccess = true): Promise<void> {
  render(
    <MemoryRouter initialEntries={[path]}>
      <SessionContext.Provider value={session}>
        <Signs signService={signService} />
      </SessionContext.Provider>
    </MemoryRouter>,
  )
  if (hasAccess) {
    await screen.findByLabelText('Query')
    await waitForSignsRequestsToSettle()
  }
}

async function waitForSignsRequestsToSettle(): Promise<void> {
  await waitFor(() => {
    expect(screen.queryAllByText(/loading\.\.\./i)).toHaveLength(0)
  })
}
