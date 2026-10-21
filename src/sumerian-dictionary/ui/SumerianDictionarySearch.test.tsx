import { fireEvent, screen, within } from '@testing-library/react'
import {
  renderSearchPage,
  sumerianDictionaryService,
} from 'sumerian-dictionary/ui/SumerianDictionarySearch.testSupport'
import {
  sumerianStatisticsFactory,
  sumerianWordSummaryFactory,
} from 'test-support/sumerian-dictionary-fixtures'

jest.mock('sumerian-dictionary/application/SumerianDictionaryService')

const firstPage = sumerianWordSummaryFactory.buildList(25)
const secondPage = sumerianWordSummaryFactory.buildList(2)

function lemmaRows(): HTMLElement[] {
  return within(screen.getByRole('list', { name: 'Lemmas' })).getAllByRole(
    'listitem',
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  sumerianDictionaryService.statistics.mockResolvedValue(
    sumerianStatisticsFactory.build(),
  )
})

it('shows the total and appends the next page on Show more', async () => {
  sumerianDictionaryService.search
    .mockResolvedValueOnce({ total: 1027, entries: firstPage })
    .mockResolvedValueOnce({ total: 1027, entries: secondPage })
  renderSearchPage('/tools/sumerian-dictionary?query=lugal')
  expect(await screen.findByText('1,027 lemmas')).toBeInTheDocument()
  expect(lemmaRows()).toHaveLength(25)

  fireEvent.click(
    screen.getByRole('button', { name: 'Show more (1,002 left)' }),
  )
  expect(
    await screen.findByRole('button', { name: 'Show more (1,000 left)' }),
  ).toBeInTheDocument()
  expect(lemmaRows()).toHaveLength(27)
  expect(sumerianDictionaryService.search).toHaveBeenLastCalledWith(
    { query: 'lugal', kind: 'all', source: 'any', limit: 25, offset: 25 },
    expect.any(AbortSignal),
  )
})

it('hides Show more when everything is shown', async () => {
  sumerianDictionaryService.search.mockResolvedValueOnce({
    total: 2,
    entries: secondPage,
  })
  renderSearchPage('/tools/sumerian-dictionary?query=lugal')
  expect(await screen.findByText('2 lemmas')).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: /Show more/ }),
  ).not.toBeInTheDocument()
})

it('reports a failed Show more and lets it be tried again', async () => {
  sumerianDictionaryService.search
    .mockResolvedValueOnce({ total: 30, entries: firstPage })
    .mockRejectedValueOnce(new Error('Server unavailable'))
  renderSearchPage('/tools/sumerian-dictionary?query=lugal')
  fireEvent.click(
    await screen.findByRole('button', { name: 'Show more (5 left)' }),
  )
  expect(await screen.findByText('Server unavailable')).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Show more (5 left)' }),
  ).toBeInTheDocument()
})
