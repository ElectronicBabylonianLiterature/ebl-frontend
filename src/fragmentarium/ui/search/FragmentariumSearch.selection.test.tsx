import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouterProps, useLocation } from 'react-router-dom'
import { Tabs } from 'react-bootstrap'
import {
  createFragmentariumSearchHarness,
  queryResult,
} from 'fragmentarium/ui/search/FragmentariumSearch.testSupport'

let mockTabsOnSelect: React.ComponentProps<typeof Tabs>['onSelect']
const mockNativeSelections = jest.fn()

jest.mock('react-bootstrap', () => {
  const actual =
    jest.requireActual<typeof import('react-bootstrap')>('react-bootstrap')
  return {
    ...actual,
    Tabs: (props: React.ComponentProps<typeof actual.Tabs>): JSX.Element => {
      mockTabsOnSelect = props.onSelect
      return (
        <actual.Tabs
          {...props}
          onSelect={(key, event) => {
            mockNativeSelections(key)
            props.onSelect?.(key, event)
          }}
        />
      )
    },
  }
})

function SelectionProbe(): JSX.Element {
  const location = useLocation()
  return (
    <>
      <output data-testid="history-key">{location.key}</output>
      <button
        type="button"
        onClick={(event) => mockTabsOnSelect?.(null, event)}
      >
        Probe nullable selection callback
      </button>
    </>
  )
}

it('preserves route history for current and null selections while real tab changes navigate', async () => {
  const harness = createFragmentariumSearchHarness()
  harness.fragmentService.query.mockResolvedValue(queryResult())
  const search = harness.buildSearchElement(
    { transliteration: 'kur' },
    'library',
  ) as React.ReactElement<MemoryRouterProps>
  const { children } = search.props
  const parameters =
    '?paginationIndex=4&limit=100&corpusPaginationIndex=2&corpusLimit=25'
  render(
    React.cloneElement(
      search,
      { initialEntries: [`/library/search/${parameters}#library`] },
      <>
        {children}
        <SelectionProbe />
      </>,
    ),
  )
  await screen.findByText('Found 2 matching lines. Showing documents 1-1')
  const initialHistoryKey = screen.getByTestId('history-key').textContent

  await userEvent.click(
    screen.getByRole('tab', { name: 'Library', selected: true }),
  )
  expect(mockNativeSelections).toHaveBeenLastCalledWith('library')
  expect(screen.getByTestId('history-key')).toHaveTextContent(
    new RegExp(`^${initialHistoryKey}$`),
  )
  expect(screen.getByTestId('search-location')).toHaveTextContent(
    `${parameters}#library`,
  )

  expect(mockTabsOnSelect).toBeDefined()
  await userEvent.click(
    screen.getByRole('button', { name: 'Probe nullable selection callback' }),
  )
  expect(screen.getByTestId('history-key')).toHaveTextContent(
    new RegExp(`^${initialHistoryKey}$`),
  )
  expect(screen.getByTestId('search-location')).toHaveTextContent(
    `${parameters}#library`,
  )

  await userEvent.click(screen.getByRole('tab', { name: 'Corpus' }))
  expect(mockNativeSelections).toHaveBeenLastCalledWith('corpus')
  expect(
    screen.getByRole('tab', { name: 'Corpus', selected: true }),
  ).toBeVisible()
  expect(screen.getByTestId('search-location')).toHaveTextContent(
    `${parameters}#corpus`,
  )
  const corpusHistoryKey = screen.getByTestId('history-key').textContent
  expect(corpusHistoryKey).not.toBe(initialHistoryKey)

  await userEvent.click(
    screen.getByRole('tab', { name: 'Corpus', selected: true }),
  )
  expect(screen.getByTestId('history-key')).toHaveTextContent(
    new RegExp(`^${corpusHistoryKey}$`),
  )
  expect(harness.fragmentService.query).toHaveBeenCalledTimes(1)
})
