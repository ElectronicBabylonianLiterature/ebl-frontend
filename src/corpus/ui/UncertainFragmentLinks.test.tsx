import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import UncertainFragmentLinks from 'corpus/ui/UncertainFragmentLinks'

const isInFragmentarium = jest.fn<Promise<boolean>, [string]>()
const fragmentService = { isInFragmentarium }
const uncertainFragments = [
  { museumNumber: 'K.1' },
  { museumNumber: 'K.404' },
  { museumNumber: 'K.1' },
]

beforeEach(() => jest.resetAllMocks())

function renderLinks(fragments = uncertainFragments) {
  const element = (items = fragments) => (
    <MemoryRouter>
      <UncertainFragmentLinks
        uncertainFragments={items}
        fragmentService={fragmentService}
      />
    </MemoryRouter>
  )
  return { ...render(element()), element }
}

test('does not start lookups while rendering', () => {
  renderToString(
    <UncertainFragmentLinks
      uncertainFragments={uncertainFragments}
      fragmentService={fragmentService}
    />,
  )

  expect(isInFragmentarium).not.toHaveBeenCalled()
})

test('links only confirmed fragments and deduplicates lookups across renders', async () => {
  isInFragmentarium.mockImplementation(async (number) => number === 'K.1')
  const { rerender, element } = renderLinks()

  expect(await screen.findAllByRole('link', { name: 'K.1' })).toHaveLength(2)
  expect(screen.getByText('K.404')).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'K.404' })).not.toBeInTheDocument()
  expect(isInFragmentarium).toHaveBeenCalledTimes(2)

  rerender(element([...uncertainFragments]))
  expect(isInFragmentarium).toHaveBeenCalledTimes(2)
})

test('shows operational failures and allows retry', async () => {
  isInFragmentarium
    .mockRejectedValueOnce(new Error('Unavailable'))
    .mockResolvedValue(true)
  renderLinks([{ museumNumber: 'K.1' }])

  expect(await screen.findByText('Unavailable')).toBeInTheDocument()
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
  await act(async () => screen.getByRole('button', { name: 'Retry' }).click())

  expect(await screen.findByRole('link', { name: 'K.1' })).toBeInTheDocument()
  expect(screen.queryByText('Unavailable')).not.toBeInTheDocument()
})

test('does not apply a previous fragment list result after props change', async () => {
  let resolvePrevious: (exists: boolean) => void = () => undefined
  isInFragmentarium
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePrevious = resolve
        }),
    )
    .mockResolvedValue(false)
  const { rerender, element } = renderLinks([{ museumNumber: 'K.1' }])
  await waitFor(() => expect(isInFragmentarium).toHaveBeenCalledWith('K.1'))
  rerender(element([{ museumNumber: 'K.2' }]))
  expect(await screen.findByText('K.2')).toBeInTheDocument()

  await act(async () => resolvePrevious(true))

  expect(screen.queryByText('K.1')).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'K.2' })).not.toBeInTheDocument()
})

test.each(['resolve', 'reject'])(
  'ignores a late %s after unmount',
  async (settlement) => {
    let resolveLookup: (exists: boolean) => void = () => undefined
    let rejectLookup: (error: Error) => void = () => undefined
    isInFragmentarium.mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          resolveLookup = resolve
          rejectLookup = reject
        }),
    )
    const { unmount } = renderLinks([{ museumNumber: 'K.1' }])
    await waitFor(() => expect(isInFragmentarium).toHaveBeenCalledTimes(1))
    unmount()

    await act(async () => {
      if (settlement === 'resolve') resolveLookup(true)
      else rejectLookup(new Error('Late failure'))
    })

    expect(screen.queryByText('K.1')).not.toBeInTheDocument()
    expect(screen.queryByText('Late failure')).not.toBeInTheDocument()
  },
)

test('handles an empty list without starting a request', async () => {
  renderLinks([])

  await waitFor(() => expect(screen.getByRole('list')).toBeEmptyDOMElement())
  expect(isInFragmentarium).not.toHaveBeenCalled()
})

test('limits concurrent existence checks and abandons queued lookups on unmount', async () => {
  const pendingResolutions: Array<(exists: boolean) => void> = []
  isInFragmentarium.mockImplementation(
    () =>
      new Promise<boolean>((resolve) => {
        pendingResolutions.push(resolve)
      }),
  )
  const numbers = Array.from({ length: 6 }, (_, index) => ({
    museumNumber: `K.${index + 1}`,
  }))
  const { unmount } = renderLinks(numbers)

  await waitFor(() => expect(isInFragmentarium).toHaveBeenCalledTimes(4))
  expect(pendingResolutions).toHaveLength(4)

  await act(async () => pendingResolutions[0](true))
  await waitFor(() => expect(isInFragmentarium).toHaveBeenCalledTimes(5))

  unmount()
  await act(async () => {
    pendingResolutions.slice(1).forEach((resolve) => resolve(false))
  })
  expect(isInFragmentarium).toHaveBeenCalledTimes(5)
})
