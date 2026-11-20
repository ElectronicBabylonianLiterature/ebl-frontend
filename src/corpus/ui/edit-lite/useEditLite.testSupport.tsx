import { act, renderHook, waitFor } from '@testing-library/react'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import { EditLiteActions } from 'corpus/ui/edit-lite/EditLiteContext'
import {
  buildEditLiteOutline,
  createFakeChapterEditSource,
  FakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { EditLiteState, LineState } from 'corpus/ui/edit-lite/editLiteState'
import useEditLite, { EditLite } from 'corpus/ui/edit-lite/useEditLite'

export interface EditLiteHook {
  readonly source: FakeChapterEditSource
  readonly outline: ChapterOutline
  readonly result: { readonly current: EditLite }
  state(): EditLiteState
  actions(): EditLiteActions
  run(action: (actions: EditLiteActions) => void): void
  load(offset: number, limit: number): Promise<void>
  waitForLine(index: number, status: string): Promise<LineState>
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

export function holdNextCall<Result, Parameters extends unknown[]>(
  mock: jest.MockInstance<Promise<Result>, Parameters>,
): Deferred<void> {
  const held = createDeferred<void>()
  const implementation = mock.getMockImplementation() as (
    ...parameters: Parameters
  ) => Promise<Result>
  mock.mockImplementationOnce(async (...parameters: Parameters) => {
    await held.promise
    return implementation(...parameters)
  })
  return held
}

export function renderEditLiteHook(
  lines: readonly Line[],
  source: FakeChapterEditSource = createFakeChapterEditSource({ lines }),
  canWrite = true,
): EditLiteHook {
  const outline = buildEditLiteOutline(lines)
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
