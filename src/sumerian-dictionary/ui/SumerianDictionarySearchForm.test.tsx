import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { exampleQueries } from 'sumerian-dictionary/ui/SumerianDictionarySearchForm'
import {
  renderSearchPage,
  sumerianDictionaryService,
} from 'sumerian-dictionary/ui/SumerianDictionarySearch.testSupport'
import { sumerianStatisticsFactory } from 'test-support/sumerian-dictionary-fixtures'

jest.mock('sumerian-dictionary/application/SumerianDictionaryService')

beforeEach(() => {
  jest.clearAllMocks()
  sumerianDictionaryService.statistics.mockResolvedValue(
    sumerianStatisticsFactory.build(),
  )
  sumerianDictionaryService.findSummaries.mockResolvedValue([])
  sumerianDictionaryService.search.mockResolvedValue({ total: 0, entries: [] })
})

function location(): HTMLElement {
  return screen.getByTestId('location')
}

it('writes the converted query, kind and source to the URL on submit', async () => {
  renderSearchPage()
  fireEvent.change(screen.getByLabelText('Search Sumerian lemmas'), {
    target: { value: ' szu dug4 ' },
  })
  fireEvent.click(
    within(screen.getByRole('group', { name: 'Kind' })).getByLabelText(
      'Proper nouns',
    ),
  )
  fireEvent.click(
    within(screen.getByRole('group', { name: 'Source' })).getByLabelText(
      'Attinger',
    ),
  )
  fireEvent.click(screen.getByRole('button', { name: 'Search' }))
  await waitFor(() =>
    expect(location()).toHaveTextContent(
      '/tools/sumerian-dictionary?kind=names&query=%C5%A1u%20dug%E2%82%84&source=attinger',
    ),
  )
  expect(await screen.findByText('No results found.')).toBeInTheDocument()
})

it('keeps ĝ as typed', async () => {
  renderSearchPage()
  fireEvent.change(screen.getByLabelText('Search Sumerian lemmas'), {
    target: { value: 'ĝeš' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Search' }))
  await waitFor(() =>
    expect(location()).toHaveTextContent(
      '/tools/sumerian-dictionary?query=%C4%9De%C5%A1',
    ),
  )
})

it.each([
  ['fève', '/tools/sumerian-dictionary?query=f%C3%A8ve'],
  ['gods, kings', '/tools/sumerian-dictionary?query=gods%2C%20kings'],
])('sends the meaning query %p as typed', async (query, url) => {
  renderSearchPage()
  fireEvent.change(screen.getByLabelText('Search Sumerian lemmas'), {
    target: { value: query },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Search' }))
  await waitFor(() => expect(location()).toHaveTextContent(url))
})

it('offers the example queries as links keeping the filters', async () => {
  renderSearchPage('/tools/sumerian-dictionary?query=x&source=epsd2')
  await screen.findByText('No results found.')
  expect(
    exampleQueries.map((example) =>
      screen.getByRole('link', { name: example }).getAttribute('href'),
    ),
  ).toEqual([
    '/tools/sumerian-dictionary?query=lugal&source=epsd2',
    '/tools/sumerian-dictionary?query=dug%E2%82%84&source=epsd2',
    '/tools/sumerian-dictionary?query=king&source=epsd2',
    '/tools/sumerian-dictionary?query=%C5%A1arru&source=epsd2',
    '/tools/sumerian-dictionary?query=%C5%A1u&source=epsd2',
  ])
})

it('resets the form when the URL changes', async () => {
  renderSearchPage('/tools/sumerian-dictionary?query=x')
  await screen.findByText('No results found.')
  fireEvent.click(screen.getByRole('link', { name: 'lugal' }))
  await waitFor(() =>
    expect(screen.getByLabelText('Search Sumerian lemmas')).toHaveValue(
      'lugal',
    ),
  )
})
