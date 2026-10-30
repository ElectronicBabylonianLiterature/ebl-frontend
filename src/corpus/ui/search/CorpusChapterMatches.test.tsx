import React from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import TextService from 'corpus/application/TextService'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { LineDetails } from 'corpus/domain/line-details'
import CorpusChapterMatches, {
  mergeChapterDisplays,
  uniqueCorpusMatchPairs,
} from 'corpus/ui/search/CorpusChapterMatches'
import {
  chapterDisplayFactory,
  lineDisplayFactory,
} from 'test-support/chapter-fixtures'
import { lineVariantDisplayFactory } from 'test-support/dictionary-line-fixtures'
import { lineNumberFactory } from 'test-support/linenumber-factory'

jest.mock('corpus/application/TextService')

const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()
const base = chapterDisplayFactory.build()

function chapterWithPairs(pairs: readonly [number, number][]): ChapterDisplay {
  const lines = new Map<number, number[]>()
  pairs.forEach(([line, variant]) => {
    lines.set(line, [...(lines.get(line) ?? []), variant])
  })
  return new ChapterDisplay({
    ...base,
    lines: [...lines.entries()].map(([line, variants]) =>
      lineDisplayFactory.build({
        originalIndex: line,
        number: lineNumberFactory.build({ number: line + 1 }),
        variants: variants.map((variant, index) =>
          lineVariantDisplayFactory.build({
            originalIndex: variant,
            isPrimaryVariant: index === 0,
            reconstruction: [],
            manuscripts: [],
            parallelLines: [],
            intertext: [],
            note: null,
          }),
        ),
      }),
    ),
  })
}

function renderMatches(
  initialPairs: readonly [number, number][],
  allPairs: readonly [number, number][],
) {
  return render(
    <MemoryRouter>
      <CorpusChapterMatches
        initialChapter={chapterWithPairs(initialPairs)}
        chapterId={base.id}
        pairs={allPairs.map(([line, variant]) => ({ line, variant }))}
        initiallyVisible={initialPairs.length}
        textService={textService}
      />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
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

it('deduplicates line and variant pairs without dropping another variant on one line', () => {
  expect(uniqueCorpusMatchPairs([0, 0, 0, 1, -1, 2], [0, 1, 1, 0, 0])).toEqual([
    { line: 0, variant: 0 },
    { line: 0, variant: 1 },
    { line: 1, variant: 0 },
  ])
})

it('merges incremental results by original line and variant indexes', () => {
  const initial = chapterWithPairs([[0, 0]])
  const additional = chapterWithPairs([
    [1, 0],
    [0, 1],
  ])
  const merged = mergeChapterDisplays(initial, additional)

  expect(merged.lines.map((line) => line.originalIndex)).toEqual([0, 1])
  expect(
    merged.lines[0].variants.map((variant) => variant.originalIndex),
  ).toEqual([0, 1])
  expect(
    merged.lines[0].variants.map((variant) => variant.isPrimaryVariant),
  ).toEqual([true, false])
  expect(merged.lines[1].variants[0].originalIndex).toBe(0)
})

it('loads additional pairs only after a click and reuses them after collapse', async () => {
  textService.findChapterDisplay.mockResolvedValueOnce(
    chapterWithPairs([
      [0, 1],
      [1, 0],
    ]),
  )
  renderMatches(
    [[0, 0]],
    [
      [0, 0],
      [0, 1],
      [1, 0],
    ],
  )

  const showMoreButton = screen.getByRole('button', {
    name: 'Show 2 more matches',
  })
  expect(showMoreButton).toHaveAttribute(
    'aria-controls',
    screen.getByTestId('chapter-matches').getAttribute('id'),
  )
  expect(showMoreButton).toHaveAttribute(
    'aria-describedby',
    screen.getByTestId('chapter-match-description').getAttribute('id'),
  )
  expect(textService.findChapterDisplay).not.toHaveBeenCalled()
  await userEvent.click(
    screen.getByRole('button', { name: 'Show 2 more matches' }),
  )
  expect(textService.findChapterDisplay).toHaveBeenCalledWith(
    base.id,
    [0, 1],
    [1, 0],
  )
  expect(
    await screen.findByRole('button', { name: 'Collapse chapter matches' }),
  ).toBeVisible()
  await userEvent.click(
    screen.getByRole('button', { name: 'Collapse chapter matches' }),
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Show loaded chapter matches' }),
  )
  expect(
    screen.getByRole('button', { name: 'Collapse chapter matches' }),
  ).toBeVisible()
  expect(textService.findChapterDisplay).toHaveBeenCalledTimes(1)
})

it('loads large match lists in bounded pair batches', async () => {
  const pairs = Array.from(
    { length: 25 },
    (_unused, index): [number, number] => [index, 0],
  )
  textService.findChapterDisplay.mockImplementation(
    async (_id, lines = [], variants = []) =>
      chapterWithPairs(lines.map((line, index) => [line, variants[index]])),
  )
  renderMatches(pairs.slice(0, 3), pairs)

  await userEvent.click(
    screen.getByRole('button', { name: 'Show 10 more matches' }),
  )
  await screen.findByRole('button', { name: 'Collapse chapter matches' })
  expect(
    await screen.findByRole('button', { name: 'Show 10 more matches' }),
  ).toBeVisible()
  expect(textService.findChapterDisplay.mock.calls[0][1]).toHaveLength(10)
  await userEvent.click(
    screen.getByRole('button', { name: 'Show 10 more matches' }),
  )
  expect(
    await screen.findByRole('button', { name: 'Show 2 more matches' }),
  ).toBeVisible()
  expect(textService.findChapterDisplay).toHaveBeenCalledTimes(2)
})

it('shows failure and allows retry for the same pair batch', async () => {
  textService.findChapterDisplay
    .mockRejectedValueOnce(new Error('network'))
    .mockResolvedValueOnce(chapterWithPairs([[1, 0]]))
  renderMatches(
    [[0, 0]],
    [
      [0, 0],
      [1, 0],
    ],
  )

  await userEvent.click(
    screen.getByRole('button', { name: 'Show 1 more match' }),
  )
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Could not load chapter matches.',
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Retry loading chapter matches' }),
  )
  expect(
    await screen.findByRole('button', { name: 'Collapse chapter matches' }),
  ).toBeVisible()
  expect(textService.findChapterDisplay).toHaveBeenCalledTimes(2)
})

it('ignores a response after loading is cancelled', async () => {
  let resolveRequest: (value: ChapterDisplay) => void = () => undefined
  textService.findChapterDisplay.mockReturnValueOnce(
    new Promise<ChapterDisplay>((resolve) => {
      resolveRequest = resolve
    }),
  )
  renderMatches(
    [[0, 0]],
    [
      [0, 0],
      [1, 0],
    ],
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Show 1 more match' }),
  )
  expect(
    screen.getByRole('button', { name: 'Loading chapter matches…' }),
  ).toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: 'Cancel loading' }))
  await act(async () => {
    resolveRequest(chapterWithPairs([[1, 0]]))
  })

  expect(
    screen.getByRole('button', { name: 'Show 1 more match' }),
  ).toBeVisible()
  expect(
    screen.queryByRole('button', { name: 'Collapse chapter matches' }),
  ).not.toBeInTheDocument()
})
