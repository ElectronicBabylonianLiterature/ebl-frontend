import { act, renderHook, waitFor } from '@testing-library/react'
import ApiChapterEditSource from 'corpus/application/edit-lite/ApiChapterEditSource'
import { ChapterEditSource } from 'corpus/application/edit-lite/ChapterEditSource'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import { EditLiteActions } from 'corpus/ui/edit-lite/EditLiteContext'
import {
  buildEditLiteOutline,
  createFakeChapterEditSource,
  FakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import EditLiteFakeApi from 'corpus/ui/edit-lite/EditLiteFakeApi.testSupport'
import EditLiteFakeChapter from 'corpus/ui/edit-lite/EditLiteFakeChapter.testSupport'
import { editLiteChapterId } from 'corpus/ui/edit-lite/editLiteFixtures.testSupport'
import { EditLiteState, LineState } from 'corpus/ui/edit-lite/editLiteState'
import useEditLite, { EditLite } from 'corpus/ui/edit-lite/useEditLite'
import { getServices } from 'test-support/AppDriver'

export interface EditLiteHook<
  Source extends ChapterEditSource = FakeChapterEditSource,
> {
  readonly source: Source
  readonly outline: ChapterOutline
  readonly result: { readonly current: EditLite }
  state(): EditLiteState
  actions(): EditLiteActions
  run(action: (actions: EditLiteActions) => void): void
  load(offset: number, limit: number): Promise<void>
  waitForLine(index: number, status: string): Promise<LineState>
}

export interface ServedEditLiteHook {
  readonly chapter: EditLiteFakeChapter
  readonly fakeApi: EditLiteFakeApi
  readonly view: EditLiteHook<ApiChapterEditSource>
}

export interface Deferred<Value> {
  readonly promise: Promise<Value>
  resolve(value: Value): void
  reject(error: Error): void
}

export function createDeferred<Value>(): Deferred<Value> {
  let resolve!: (value: Value) => void
  let reject!: (error: Error) => void
  const promise = new Promise<Value>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

export function findImplementation<Result, Parameters extends unknown[]>(
  mock: jest.MockInstance<Result, Parameters>,
): (...parameters: Parameters) => Result {
  return mock.getMockImplementation() as (...parameters: Parameters) => Result
}

export function holdNextCall<Result, Parameters extends unknown[]>(
  mock: jest.MockInstance<Promise<Result>, Parameters>,
): Deferred<void> {
  const held = createDeferred<void>()
  const implementation = findImplementation(mock)
  mock.mockImplementationOnce(async (...parameters: Parameters) => {
    await held.promise
    return implementation(...parameters)
  })
  return held
}

export function holdNextAnswer<Result, Parameters extends unknown[]>(
  mock: jest.MockInstance<Promise<Result>, Parameters>,
): () => Promise<() => void> {
  const answer = createDeferred<Result>()
  const implementation = findImplementation(mock)
  const results: Promise<Result>[] = []
  mock.mockImplementationOnce((...parameters: Parameters) => {
    results.push(implementation(...parameters))
    return answer.promise
  })
  return async (): Promise<() => void> => {
    const result = await results[0]
    return (): void => answer.resolve(result)
  }
}

export function answerOnce<Result, Parameters extends unknown[]>(
  mock: jest.MockInstance<Promise<Result>, Parameters>,
  path: Parameters[0],
  answer: (result: Promise<Result>) => Promise<Result>,
): void {
  const implementation = findImplementation(mock)
  let isWaiting = true
  mock.mockImplementation((...parameters: Parameters) => {
    const result = implementation(...parameters)
    const isAnswered = isWaiting && parameters[0] === path
    isWaiting = isWaiting && !isAnswered
    return isAnswered ? answer(result) : result
  })
}

export function holdAnswerTo<Result, Parameters extends unknown[]>(
  mock: jest.MockInstance<Promise<Result>, Parameters>,
  path: Parameters[0],
): Deferred<void> {
  const held = createDeferred<void>()
  answerOnce(mock, path, (result) => held.promise.then(() => result))
  return held
}

function renderEditLiteHookWith<Source extends ChapterEditSource>(
  source: Source,
  outline: ChapterOutline,
  canWrite: boolean,
): EditLiteHook<Source> {
  const { result } = renderHook(() => useEditLite(source, outline, canWrite))
  const state = (): EditLiteState => result.current.state
  const actions = (): EditLiteActions => result.current.context.actions
  const waitForLine = async (
    index: number,
    status: string,
  ): Promise<LineState> => {
    await waitFor(() => expect(state().lines[index]?.status).toBe(status))
    return state().lines[index]
  }

  return {
    source,
    outline,
    result,
    state,
    actions,
    waitForLine,
    run: (action): void => act(() => action(actions())),
    load: async (offset, limit): Promise<void> => {
      act(() => actions().ensureLines(offset, limit))
      await waitForLine(offset + limit - 1, 'ready')
    },
  }
}

export function renderEditLiteHook(
  lines: readonly Line[],
  source: FakeChapterEditSource = createFakeChapterEditSource({ lines }),
  canWrite = true,
): EditLiteHook {
  return renderEditLiteHookWith(source, buildEditLiteOutline(lines), canWrite)
}

export async function openServedEditLiteHook(
  lines: readonly Line[],
): Promise<ServedEditLiteHook> {
  const chapter = new EditLiteFakeChapter(buildEditLiteOutline(lines), lines)
  const fakeApi = new EditLiteFakeApi().serveChapter(chapter)
  const source = new ApiChapterEditSource(
    getServices(fakeApi.client).textService,
    editLiteChapterId,
    true,
  )
  const view = renderEditLiteHookWith(source, await source.loadOutline(), true)
  await view.load(0, lines.length)
  return { chapter, fakeApi, view }
}

export async function renderEditLiteHookWithDraft(
  lines: readonly Line[],
  loadedCount: number,
  draftPosition: number,
  draft: Line,
): Promise<EditLiteHook> {
  const view = renderEditLiteHook(lines)
  await view.load(0, loadedCount)
  view.run((actions) => actions.changeLine(draftPosition, draft))
  view.source.loadLines.mockClear()
  return view
}

export async function moveAndWait<Source extends ChapterEditSource>(
  view: EditLiteHook<Source>,
  from: number,
  to: number,
  onMoved: () => void = jest.fn(),
): Promise<void> {
  const layoutVersion = view.state().layoutVersion
  view.run((actions) => actions.moveLine(from, to, onMoved))
  await waitFor(() =>
    expect(view.state().layoutVersion).toBe(layoutVersion + 1),
  )
}
