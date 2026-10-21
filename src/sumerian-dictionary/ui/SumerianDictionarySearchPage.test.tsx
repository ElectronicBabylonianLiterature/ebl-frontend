import { screen, within } from '@testing-library/react'
import MemorySession from 'auth/Session'
import { featuredSumerianWordIds } from 'sumerian-dictionary/ui/SumerianDictionaryOverview'
import {
  renderSearchPage,
  sumerianDictionaryService,
} from 'sumerian-dictionary/ui/SumerianDictionarySearch.testSupport'
import {
  sumerianStatisticsFactory,
  sumerianWordSummaryFactory,
} from 'test-support/sumerian-dictionary-fixtures'

jest.mock('sumerian-dictionary/application/SumerianDictionaryService')

beforeEach(() => {
  jest.clearAllMocks()
  sumerianDictionaryService.statistics.mockResolvedValue(
    sumerianStatisticsFactory.build(),
  )
})

it('refuses the page without the scope and fetches nothing', () => {
  renderSearchPage(undefined, new MemorySession(['read:realia']))
  expect(
    screen.getByText(/available to authorised users only/),
  ).toBeInTheDocument()
  expect(sumerianDictionaryService.statistics).not.toHaveBeenCalled()
  expect(sumerianDictionaryService.findSummaries).not.toHaveBeenCalled()
})

it('shows the notice, the introduction and the statistics in order', async () => {
  sumerianDictionaryService.findSummaries.mockResolvedValue([])
  renderSearchPage()
  expect(screen.getByRole('alert')).toHaveTextContent(
    'The Sumerian Dictionary is still under active development',
  )
  expect(
    screen.getByText(/unites the Sumerian lexicon of three reference works/),
  ).toBeInTheDocument()
  const statistics = await screen.findByRole('list', { name: 'Statistics' })
  expect(
    within(statistics)
      .getAllByRole('listitem')
      .map((item) => item.textContent),
  ).toEqual([
    '23,903 lemmas',
    '10,356 from Attinger',
    '4,751 aligned with ePSD2',
    '13,547 ePSD2 only',
    '6,178 proper nouns',
    '2,676 with Akkadian equivalents',
  ])
  expect(sumerianDictionaryService.statistics).toHaveBeenCalledWith(
    expect.any(AbortSignal),
  )
})

it('shows the selected entries when there is no query', async () => {
  const featured = sumerianWordSummaryFactory.build({
    citationForm: 'nam-lugal',
  })
  sumerianDictionaryService.findSummaries.mockResolvedValue([featured])
  renderSearchPage()
  expect(await screen.findByText('Selected entries')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'nam-lugal' })).toBeInTheDocument()
  expect(sumerianDictionaryService.findSummaries).toHaveBeenCalledWith(
    featuredSumerianWordIds,
    expect.any(AbortSignal),
  )
  expect(sumerianDictionaryService.search).not.toHaveBeenCalled()
})

it('searches with the state in the URL', async () => {
  sumerianDictionaryService.search.mockResolvedValue({
    total: 1,
    entries: [sumerianWordSummaryFactory.build({ citationForm: 'dug₄' })],
  })
  renderSearchPage('/tools/sumerian-dictionary?query=dug₄&kind=words')
  expect(await screen.findByText('1 lemma')).toBeInTheDocument()
  expect(sumerianDictionaryService.search).toHaveBeenCalledWith(
    { query: 'dug₄', kind: 'words', source: 'any', limit: 25, offset: 0 },
    expect.any(AbortSignal),
  )
  expect(screen.getByLabelText('Search Sumerian lemmas')).toHaveValue('dug₄')
  expect(
    within(screen.getByRole('group', { name: 'Kind' })).getByLabelText('Words'),
  ).toBeChecked()
  expect(sumerianDictionaryService.findSummaries).not.toHaveBeenCalled()
})
