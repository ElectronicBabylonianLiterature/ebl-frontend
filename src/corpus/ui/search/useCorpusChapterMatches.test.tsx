import {
  act,
  renderHook,
  RenderHookResult,
  waitFor,
} from '@testing-library/react'
import TextService from 'corpus/application/TextService'
import { ChapterDisplay } from 'corpus/domain/chapter'
import useCorpusChapterMatches from 'corpus/ui/search/useCorpusChapterMatches'
import {
  baseChapterDisplay,
  chapterWithPairs,
} from 'corpus/ui/search/CorpusChapterMatches.testSupport'
import { deferred } from 'test-support/concurrencyLimiterHelpers'

jest.mock('corpus/application/TextService')

const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()
const pairs = [
  { line: 0, variant: 0 },
  { line: 0, variant: 2 },
  { line: 1, variant: 0 },
]

function renderMatchesHook(): {
  initialChapter: ChapterDisplay
  view: RenderHookResult<ReturnType<typeof useCorpusChapterMatches>, void>
} {
  const initialChapter = chapterWithPairs([[0, 0]])
  const view = renderHook<ReturnType<typeof useCorpusChapterMatches>, void>(
    () =>
      useCorpusChapterMatches(
        initialChapter,
        baseChapterDisplay.id,
        pairs,
        1,
        textService,
      ),
  )
  return { initialChapter, view }
}

beforeEach(() => {
  textService.findChapterDisplay.mockReset()
})

it('ignores another public showMore call while loading and fetches no empty batch after completion', async () => {
  const pending = deferred<ChapterDisplay>()
  textService.findChapterDisplay.mockReturnValueOnce(pending.promise)
  const { initialChapter, view } = renderMatchesHook()

  act(() => view.result.current.showMore())
  expect(view.result.current.loading).toBe(true)
  act(() => view.result.current.showMore())
  expect(textService.findChapterDisplay).toHaveBeenCalledTimes(1)
  expect(textService.findChapterDisplay).toHaveBeenCalledWith(
    baseChapterDisplay.id,
    [0, 1],
    [2, 0],
  )

  await act(async () => {
    pending.resolve(
      chapterWithPairs([
        [0, 2],
        [1, 0],
      ]),
    )
  })
  expect(view.result.current).toMatchObject({
    loadedPairs: 3,
    remaining: 0,
    loading: false,
    expanded: true,
    error: false,
    unavailable: false,
  })
  expect(
    view.result.current.chapter.lines.map((line) => line.originalIndex),
  ).toEqual([0, 1])
  expect(
    view.result.current.chapter.lines[0].variants.map(
      (variant) => variant.originalIndex,
    ),
  ).toEqual([0, 2])
  expect(
    initialChapter.lines[0].variants.map((variant) => variant.originalIndex),
  ).toEqual([0])
  const loadedChapter = view.result.current.chapter

  act(() => view.result.current.showMore())
  expect(textService.findChapterDisplay).toHaveBeenCalledTimes(1)
  expect(view.result.current.chapter).toBe(loadedChapter)
  act(() => view.result.current.collapse())
  expect(view.result.current.expanded).toBe(false)
  act(() => view.result.current.showMore())
  expect(view.result.current.expanded).toBe(true)
  expect(view.result.current.chapter).toBe(loadedChapter)
  expect(textService.findChapterDisplay).toHaveBeenCalledTimes(1)
})

it('retains the loaded chapter and pair count when a response lacks a requested variant', async () => {
  textService.findChapterDisplay.mockResolvedValueOnce(
    chapterWithPairs([[1, 0]]),
  )
  const { initialChapter, view } = renderMatchesHook()

  act(() => view.result.current.showMore())
  await waitFor(() => expect(view.result.current.unavailable).toBe(true))

  expect(view.result.current).toMatchObject({
    loadedPairs: 1,
    remaining: 2,
    nextBatchSize: 2,
    loading: false,
    expanded: false,
    error: false,
  })
  expect(view.result.current.chapter).toBe(initialChapter)
  expect(textService.findChapterDisplay).toHaveBeenCalledTimes(1)
})

it.each(['collapse', 'unmount'] as const)(
  'ignores a pending rejection after %s and leaves a new instance clean',
  async (transition) => {
    let rejectRequest!: (error: Error) => void
    textService.findChapterDisplay.mockReturnValueOnce(
      new Promise<ChapterDisplay>((_resolve, reject) => {
        rejectRequest = reject
      }),
    )
    const { view, initialChapter } = renderMatchesHook()
    act(() => view.result.current.showMore())
    expect(view.result.current.loading).toBe(true)

    if (transition === 'collapse') act(() => view.result.current.collapse())
    else view.unmount()
    const utils = renderMatchesHook()
    await act(async () => {
      rejectRequest(new Error('obsolete chapter request failed'))
    })

    expect(utils.view.result.current).toMatchObject({
      loadedPairs: 1,
      expanded: false,
      loading: false,
      error: false,
      unavailable: false,
    })
    expect(utils.view.result.current.chapter).toBe(utils.initialChapter)
    if (transition === 'collapse') {
      expect(view.result.current).toMatchObject({
        loadedPairs: 1,
        expanded: false,
        loading: false,
        error: false,
        unavailable: false,
      })
      expect(view.result.current.chapter).toBe(initialChapter)
    }
    expect(textService.findChapterDisplay).toHaveBeenCalledTimes(1)
  },
)
