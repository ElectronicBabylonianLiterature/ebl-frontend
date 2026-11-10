import React from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchFormDossier from 'fragmentarium/ui/search/SearchFormDossier'
import { DossierRecordSuggestion } from 'dossiers/domain/DossierRecord'
import { deferred } from 'test-support/concurrencyLimiterHelpers'

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

async function flushDebounce(): Promise<void> {
  await act(async () => {
    jest.advanceTimersByTime(250)
  })
}

it('does not send whitespace-only queries to dossier suggestions', async () => {
  const search = jest.fn().mockResolvedValue([])
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
  render(
    <SearchFormDossier
      ariaLabel="Dossier Search"
      value={null}
      searchSuggestions={search}
      onChange={jest.fn()}
    />,
  )
  await user.type(screen.getByLabelText('Dossier Search'), ' ')
  await flushDebounce()
  expect(search).not.toHaveBeenCalled()
  expect(screen.queryByRole('option')).not.toBeInTheDocument()
})

it('discards a completed older request after the search text changes', async () => {
  const older = deferred<readonly DossierRecordSuggestion[]>()
  const newer = deferred<readonly DossierRecordSuggestion[]>()
  const search = jest
    .fn()
    .mockReturnValueOnce(older.promise)
    .mockReturnValueOnce(newer.promise)
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
  render(
    <SearchFormDossier
      ariaLabel="Dossier Search"
      value={null}
      searchSuggestions={search}
      onChange={jest.fn()}
    />,
  )
  const input = screen.getByLabelText('Dossier Search')
  await user.type(input, 'old')
  await flushDebounce()
  expect(search).toHaveBeenLastCalledWith('old', undefined)
  await user.clear(input)
  await user.type(input, 'new')
  await flushDebounce()
  expect(search).toHaveBeenLastCalledWith('new', undefined)
  await act(async () => {
    older.resolve([
      new DossierRecordSuggestion({ id: 'OLD', description: 'Outdated' }),
    ])
    newer.resolve([
      new DossierRecordSuggestion({ id: 'NEW', description: 'Current' }),
    ])
  })
  expect(screen.getByRole('option')).toHaveTextContent('Current')
  expect(screen.queryByText(/Outdated/)).not.toBeInTheDocument()
})
