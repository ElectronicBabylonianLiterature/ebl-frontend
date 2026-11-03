import { getCorpusSearchPresentation } from 'corpus/ui/search/CorpusSearchPresentation'
import { corpusQueryItemFactory } from 'test-support/query-item-factory'
import { CorpusQueryResult } from 'query/QueryResult'

const variantMatches = corpusQueryItemFactory.build({
  lines: [0, 0],
  variants: [0, 2],
  matchCount: 2,
})

const cases: {
  name: string
  result: CorpusQueryResult
  pageIndex: number
  summary: string
  hasNextPage: boolean
}[] = [
  {
    name: 'unknown chapter total with two variants of one physical line',
    result: { items: [variantMatches], matchCountTotal: 2, hasNextPage: false },
    pageIndex: 0,
    summary: 'Found 2 matching line variants. Showing chapters 1-1',
    hasNextPage: false,
  },
  {
    name: 'known chapter total',
    result: { items: [variantMatches], totalChapters: 1, matchCountTotal: 2 },
    pageIndex: 0,
    summary:
      'Found 2 matching line variants in 1 chapter. Showing chapters 1-1 of 1',
    hasNextPage: false,
  },
  {
    name: 'approximate global match count with more chapters',
    result: {
      items: [variantMatches],
      matchCountTotal: 2000,
      isMatchCountTotalExact: false,
      hasNextPage: true,
    },
    pageIndex: 0,
    summary:
      'Found about 2,000 matching line variants. Showing chapters 1-1; more results are available',
    hasNextPage: true,
  },
  {
    name: 'unknown chapter total singular',
    result: {
      items: [{ ...variantMatches, lines: [0], variants: [2], matchCount: 1 }],
      matchCountTotal: 1,
      hasNextPage: false,
    },
    pageIndex: 0,
    summary: 'Found 1 matching line variant. Showing chapters 1-1',
    hasNextPage: false,
  },
  {
    name: 'later page approximate global matches',
    result: {
      items: [variantMatches],
      matchCountTotal: 2000,
      isMatchCountTotalExact: false,
      hasNextPage: true,
    },
    pageIndex: 1,
    summary: 'Found about 2,000 matching line variants. Showing chapters 26-26',
    hasNextPage: true,
  },
  {
    name: 'unknown line count',
    result: { items: [], matchCountTotal: null, hasNextPage: false },
    pageIndex: 0,
    summary: 'Found 0 chapters',
    hasNextPage: false,
  },
  {
    name: 'known zero',
    result: {
      items: [],
      totalChapters: 0,
      matchCountTotal: 0,
      hasNextPage: false,
    },
    pageIndex: 0,
    summary: 'Found 0 matching line variants in 0 chapters',
    hasNextPage: false,
  },
  {
    name: 'unknown chapter total and zero matches',
    result: { items: [], matchCountTotal: 0, hasNextPage: false },
    pageIndex: 0,
    summary: 'Found 0 matching line variants. Showing 0 chapters',
    hasNextPage: false,
  },
  {
    name: 'later empty unknown page',
    result: { items: [], matchCountTotal: null, hasNextPage: false },
    pageIndex: 2,
    summary: 'No chapters on this page',
    hasNextPage: false,
  },
]

it.each(cases)('$name', ({ result, pageIndex, summary, hasNextPage }) => {
  const presentation = getCorpusSearchPresentation(result, {
    pageIndex,
    pageSize: 25,
  })
  expect(presentation.summary).toBe(summary)
  expect(presentation.hasNextPage).toBe(hasNextPage)
  expect(presentation.visibleChapters).toEqual(result.items)
  expect(presentation.lastPageIndex).toBe(
    result.totalChapters == null ? null : 0,
  )
  expect(presentation.showPaginationControls).toBe(pageIndex > 0 || hasNextPage)
})
