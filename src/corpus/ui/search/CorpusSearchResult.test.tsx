import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CorpusSearchResult } from 'corpus/ui/search/CorpusSearchResult'
import TextService from 'corpus/application/TextService'
import { CorpusQuery } from 'query/CorpusQuery'
import { CorpusQueryResult } from 'query/QueryResult'
import { LineDetails } from 'corpus/domain/line-details'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'
import { corpusQueryItemFactory } from 'test-support/query-item-factory'
import { lineVariantDisplayFactory } from 'test-support/dictionary-line-fixtures'

jest.mock('corpus/application/TextService')

const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()

function renderResult(
  result: CorpusQueryResult,
  corpusQuery: CorpusQuery = { lemmas: 'kur' },
): void {
  textService.query.mockResolvedValue(result)
  render(
    <MemoryRouter>
      <CorpusSearchResult textService={textService} corpusQuery={corpusQuery} />
    </MemoryRouter>,
  )
}

function itemOf(
  chapter = chapterDisplayFactory.build(),
  lines: readonly number[] = [0],
) {
  textService.findChapterDisplay.mockResolvedValue(chapter)
  return corpusQueryItemFactory.build({
    textId: chapter.id.textId,
    stage: chapter.id.stage,
    name: chapter.id.name,
    lines,
    variants: lines.map(() => 0),
  })
}

beforeEach(() => {
  textService.findChapterLine.mockResolvedValue(
    new LineDetails(
      [
        lineVariantDisplayFactory.build({
          reconstruction: [],
          manuscripts: [],
        }),
      ],
      0,
    ),
  )
})

it('counts the chapters when the line count is unknown', async () => {
  renderResult({ items: [], matchCountTotal: null })

  expect(await screen.findByText('Found 0 chapters')).toBeVisible()
})

it('counts a single line in a single chapter', async () => {
  renderResult({ items: [itemOf()], matchCountTotal: 1 })

  expect(await screen.findByText('Found 1 line in 1 chapter')).toBeVisible()
})

it('marks an inexact line count and further results', async () => {
  renderResult({
    items: [itemOf(), itemOf()],
    matchCountTotal: 2000,
    isMatchCountTotalExact: false,
    hasNextPage: true,
  })

  expect(
    await screen.findByText(
      'Found about 2,000 lines in 2 chapters; more results are available',
    ),
  ).toBeVisible()
})

it('names the text of a chapter', async () => {
  const chapter = chapterDisplayFactory.build({ textName: 'Poem of Erra' })
  renderResult({ items: [itemOf(chapter)], matchCountTotal: 1 })

  expect(await screen.findByText('Poem of Erra')).toBeVisible()
})

it('leaves out an empty text name', async () => {
  const chapter = chapterDisplayFactory.build({ textName: '' })
  renderResult({ items: [itemOf(chapter)], matchCountTotal: 1 })

  expect(
    await screen.findByRole('link', {
      name: /^(Literature|Divination) > [^>]*$/,
    }),
  ).toBeVisible()
})

it('tells how many more lines matched than are shown', async () => {
  renderResult(
    { items: [itemOf(undefined, [0, 1, 2, 3, 4])], matchCountTotal: 5 },
    { transliteration: 'kur\nra\n' },
  )

  expect(await screen.findByText('And 2 more')).toBeVisible()
  expect(textService.findChapterDisplay).toHaveBeenCalledWith(
    expect.anything(),
    [0, 1, 2],
    [0, 0, 0],
  )
})
