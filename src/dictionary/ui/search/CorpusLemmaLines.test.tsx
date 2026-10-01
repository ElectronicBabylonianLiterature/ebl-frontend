import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TextService from 'corpus/application/TextService'
import CorpusLemmaLines from 'dictionary/ui/search/CorpusLemmaLines'
import { CorpusQueryResult } from 'query/QueryResult'
import { DictionaryLineDisplay } from 'corpus/domain/chapter'
import { corpusQueryItemFactory } from 'test-support/query-item-factory'
import { dictionaryLineDisplayFactory } from 'test-support/dictionary-line-fixtures'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'

jest.mock('corpus/application/TextService')

const MockTextService = TextService as jest.Mock<jest.Mocked<TextService>>
const searchLinkTitle = 'View in fragmentarium search'

async function showLines(
  result: CorpusQueryResult,
  lines: DictionaryLineDisplay[] = [],
): Promise<RenderResult> {
  const textService = new MockTextService()
  textService.query.mockResolvedValue(result)
  textService.searchLemma.mockResolvedValue(lines)
  const view = render(
    <MemoryRouter>
      <CorpusLemmaLines textService={textService} lemmaId="aklu I" />
    </MemoryRouter>,
  )
  await waitForSpinnerToBeRemoved(screen)
  return view
}

test.each([
  [1, 'Matches found in 1 Corpus chapter '],
  [2, 'Matches found in 2 Corpus chapters'],
])('summarises %i matching chapters without a count', async (count, text) => {
  const view = await showLines({
    items: corpusQueryItemFactory.buildList(count),
    matchCountTotal: null,
  })

  expect(view.container).toHaveTextContent(text)
  expect(view.container).toHaveTextContent('Show matches in Corpus search')
  expect(screen.getAllByTitle(searchLinkTitle)).toHaveLength(2)
  expect(screen.getByText('No entries')).toBeInTheDocument()
})

test('shows no search link without matching chapters', async () => {
  const view = await showLines({ items: [], matchCountTotal: null })

  expect(view.container).toHaveTextContent('Matches found in 0 Corpus chapters')
  expect(screen.queryAllByTitle(searchLinkTitle)).toHaveLength(0)
})

test.each([
  [5, false, 'About 5 matches', 'Show matches in Corpus search'],
  [7, true, '7 matches', 'Show all 7 matches in Corpus search'],
  [7, undefined, '7 matches', 'Show all 7 matches in Corpus search'],
])(
  'summarises %i matches with exactness %s',
  async (matchCountTotal, isMatchCountTotalExact, summary, showLink) => {
    const view = await showLines(
      { items: [], matchCountTotal, isMatchCountTotalExact },
      dictionaryLineDisplayFactory.buildList(1),
    )

    expect(view.container).toHaveTextContent(summary)
    expect(view.container).toHaveTextContent(showLink)
    expect(screen.getAllByRole('tab').length).toBeGreaterThan(0)
  },
)

test('shows no search link without matches', async () => {
  const view = await showLines({ items: [], matchCountTotal: 0 })

  expect(view.container).toHaveTextContent('0 matches')
  expect(view.container).not.toHaveTextContent('About')
  expect(screen.queryAllByTitle(searchLinkTitle)).toHaveLength(0)
})
