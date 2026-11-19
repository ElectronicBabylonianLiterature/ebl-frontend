import { act, renderHook, waitFor } from '@testing-library/react'
import { toLineEditsDto } from 'corpus/application/edit-lite/lineEdits'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  createFakeChapterEditSource,
  FakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import useEditLite, {
  EditLite,
  lineNotReturnedMessage,
} from 'corpus/ui/edit-lite/useEditLite'

const lines: readonly Line[] = buildEditLiteLines()
const outline = buildEditLiteOutline(lines)

interface EditLiteView {
  readonly source: FakeChapterEditSource
  readonly result: { readonly current: EditLite }
  readonly rerender: (source: FakeChapterEditSource) => void
}

function renderEditLite(
  source: FakeChapterEditSource = createFakeChapterEditSource({ lines }),
): EditLiteView {
  const { result, rerender } = renderHook(
    (currentSource: FakeChapterEditSource) =>
      useEditLite(currentSource, outline),
    { initialProps: source },
  )
  return { source, result, rerender }
}

function ensureLines(view: EditLiteView, offset: number, limit: number): void {
  act(() => view.result.current.context.actions.ensureLines(offset, limit))
}

async function waitForStatus(
  view: EditLiteView,
  index: number,
  status: string,
): Promise<void> {
  await waitFor(() =>
    expect(view.result.current.state.lines[index]?.status).toBe(status),
  )
}

test('starts with the outline and exposes the source', () => {
  const { result, source } = renderEditLite(
    createFakeChapterEditSource({ kind: 'legacy', lines }),
  )
  const { state, context } = result.current

  expect(state).toEqual({ outline, lines: {} })
  expect(context.kind).toBe('legacy')
  expect(context.canSave).toBe(false)
  expect(context.manuscripts).toBe(outline.manuscripts)
  expect(context.describeSave(1, lines[1])).toEqual(toLineEditsDto(1, lines[1]))
  expect(source.describeSave).toHaveBeenCalledWith(1, lines[1])
})

test('ensureLines marks the lines as loading and then stores them', async () => {
  const view = renderEditLite()
  ensureLines(view, 0, 2)

  expect(view.result.current.state.lines).toEqual({
    0: { status: 'loading', original: null, draft: null, error: null },
    1: { status: 'loading', original: null, draft: null, error: null },
  })

  await waitForStatus(view, 1, 'ready')

  expect(view.source.loadLines).toHaveBeenCalledTimes(1)
  expect(view.source.loadLines).toHaveBeenCalledWith(0, 2)
  expect(view.result.current.state.lines[0]).toEqual({
    status: 'ready',
    original: lines[0],
    draft: lines[0],
    error: null,
  })
})

test('ensureLines combines requests made in the same tick', async () => {
  const view = renderEditLite()
  act(() => {
    const { ensureLines: ensure } = view.result.current.context.actions
    ensure(2, 1)
    ensure(0, 1)
    ensure(1, 1)
    ensure(0, 3)
  })
  await waitForStatus(view, 2, 'ready')

  expect(view.source.loadLines).toHaveBeenCalledTimes(1)
  expect(view.source.loadLines).toHaveBeenCalledWith(0, 3)
})

test('ensureLines requests separate ranges separately', async () => {
  const view = renderEditLite()
  act(() => {
    view.result.current.context.actions.ensureLines(2, 1)
    view.result.current.context.actions.ensureLines(0, 1)
  })
  await waitForStatus(view, 0, 'ready')
  await waitForStatus(view, 2, 'ready')

  expect(view.source.loadLines.mock.calls).toEqual([
    [0, 1],
    [2, 1],
  ])
  expect(view.result.current.state.lines[2].original).toBe(lines[2])
})

test('ensureLines only requests lines that have no entry yet', async () => {
  const view = renderEditLite()
  ensureLines(view, 1, 1)
  await waitForStatus(view, 1, 'ready')
  const loadedState = view.result.current.state
  ensureLines(view, 1, 1)

  expect(view.result.current.state).toBe(loadedState)

  ensureLines(view, -5, 50)
  await waitForStatus(view, 0, 'ready')
  await waitForStatus(view, 2, 'ready')

  expect(view.source.loadLines.mock.calls).toEqual([
    [1, 1],
    [0, 1],
    [2, 1],
  ])
  expect(Object.keys(view.result.current.state.lines)).toEqual(['0', '1', '2'])
})

test.each<[string, Error | string, string]>([
  ['an error', new Error('Network error'), 'Network error'],
  ['a plain value', 'Service unavailable', 'Service unavailable'],
])(
  'ensureLines stores the failure for %s',
  async (_name, rejection, message) => {
    const view = renderEditLite()
    view.source.loadLines.mockRejectedValueOnce(rejection)
    ensureLines(view, 0, 2)
    await waitForStatus(view, 0, 'failed')

    expect(view.result.current.state.lines).toEqual({
      0: { status: 'failed', original: null, draft: null, error: message },
      1: { status: 'failed', original: null, draft: null, error: message },
    })
  },
)

test('ensureLines fails the lines the source did not return', async () => {
  const view = renderEditLite()
  view.source.loadLines.mockResolvedValueOnce([lines[0]])
  ensureLines(view, 0, 3)
  await waitForStatus(view, 0, 'ready')

  expect(view.result.current.state.lines[1]).toEqual({
    status: 'failed',
    original: null,
    draft: null,
    error: lineNotReturnedMessage,
  })
  expect(view.result.current.state.lines[2].status).toBe('failed')
})

test('ensureLines ignores lines the source returned in excess', async () => {
  const view = renderEditLite()
  view.source.loadLines.mockResolvedValueOnce(lines)
  ensureLines(view, 0, 1)
  await waitForStatus(view, 0, 'ready')

  expect(Object.keys(view.result.current.state.lines)).toEqual(['0'])
})

test('a failed line can be requested again after a reset', async () => {
  const view = renderEditLite()
  view.source.loadLines.mockRejectedValueOnce(new Error('Network error'))
  ensureLines(view, 0, 1)
  await waitForStatus(view, 0, 'failed')
  act(() => view.result.current.context.actions.resetLine(0))
  ensureLines(view, 0, 1)
  await waitForStatus(view, 0, 'ready')

  expect(view.source.loadLines).toHaveBeenCalledTimes(2)
})

test('changeLine and resetLine update the draft', async () => {
  const view = renderEditLite()
  const draft = setLineNumber(lines[0], '1a')
  ensureLines(view, 0, 1)
  await waitForStatus(view, 0, 'ready')
  act(() => view.result.current.context.actions.changeLine(0, draft))

  expect(view.result.current.state.lines[0].draft).toBe(draft)

  act(() => view.result.current.context.actions.resetLine(0))

  expect(view.result.current.state.lines[0].draft).toBe(lines[0])
})

test('the actions and the context stay stable while lines change', async () => {
  const view = renderEditLite()
  const { context } = view.result.current
  ensureLines(view, 0, 3)
  await waitForStatus(view, 0, 'ready')
  act(() => context.actions.changeLine(0, setLineNumber(lines[0], 'changed')))

  expect(view.result.current.context).toBe(context)
  expect(view.result.current.state.lines[0].draft?.number).toBe('changed')
})

test('a new source keeps the actions and updates the context', async () => {
  const view = renderEditLite()
  const { actions } = view.result.current.context
  const legacySource = createFakeChapterEditSource({ kind: 'legacy', lines })
  view.rerender(legacySource)
  ensureLines(view, 0, 1)
  await waitForStatus(view, 0, 'ready')

  expect(view.result.current.context.kind).toBe('legacy')
  expect(view.result.current.context.actions).toBe(actions)
  expect(legacySource.loadLines).toHaveBeenCalledWith(0, 1)
  expect(view.source.loadLines).not.toHaveBeenCalled()
})
