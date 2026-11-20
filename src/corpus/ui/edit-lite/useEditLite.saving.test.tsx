import { act, renderHook, waitFor } from '@testing-library/react'
import { EditStatus, Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  createFakeChapterEditSource,
  FakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import useEditLite, {
  EditLite,
  lineNotReloadedMessage,
} from 'corpus/ui/edit-lite/useEditLite'

const lines: readonly Line[] = buildEditLiteLines()
const outline = buildEditLiteOutline(lines)
const draft: Line = setLineNumber(lines[1], '2a')

interface EditLiteView {
  readonly source: FakeChapterEditSource
  readonly result: { readonly current: EditLite }
}

function currentState(view: EditLiteView): EditLiteState {
  return view.result.current.state
}

async function waitForStatus(
  view: EditLiteView,
  status: string,
): Promise<void> {
  await waitFor(() => expect(currentState(view).lines[1]?.status).toBe(status))
}

async function renderWithDraft(): Promise<EditLiteView> {
  const source = createFakeChapterEditSource({ lines })
  const { result } = renderHook(() => useEditLite(source, outline, true))
  const view = { source, result }
  act(() => result.current.context.actions.ensureLines(1, 1))
  await waitForStatus(view, 'ready')
  act(() => result.current.context.actions.changeLine(1, draft))
  source.loadLines.mockClear()
  return view
}

function saveLine(view: EditLiteView): void {
  act(() => view.result.current.context.actions.saveLine(1))
}

test('saveLine saves the draft, reloads the line and updates the outline', async () => {
  const view = await renderWithDraft()
  saveLine(view)

  expect(currentState(view).lines[1]).toEqual({
    status: 'saving',
    original: lines[1],
    draft,
    error: null,
  })

  await waitForStatus(view, 'ready')
  const savedLine: Line = { ...draft, status: EditStatus.CLEAN }

  expect(view.source.saveLine).toHaveBeenCalledTimes(1)
  expect(view.source.saveLine).toHaveBeenCalledWith(1, lines[1], draft)
  expect(view.source.loadLines.mock.calls).toEqual([[1, 1]])
  expect(currentState(view).lines[1]).toEqual({
    status: 'ready',
    original: savedLine,
    draft: savedLine,
    error: null,
  })
  expect(currentState(view).outline.lines[1].number).toBe('2a')
  expect(currentState(view).outline.lines[0]).toBe(outline.lines[0])
  expect(view.result.current.context.manuscripts).toBe(outline.manuscripts)
})

test.each<[string, Error | string, string]>([
  ['an error', new Error('The line has changed.'), 'The line has changed.'],
  ['a plain value', 'Forbidden', 'Forbidden'],
])(
  'saveLine keeps the draft when saving fails with %s',
  async (_name, rejection, message) => {
    const view = await renderWithDraft()
    view.source.saveLine.mockRejectedValueOnce(rejection)
    saveLine(view)
    await waitForStatus(view, 'failed')

    expect(currentState(view).lines[1]).toEqual({
      status: 'failed',
      original: lines[1],
      draft,
      error: message,
    })
    expect(view.source.loadLines).not.toHaveBeenCalled()
    expect(currentState(view).outline).toBe(outline)
  },
)

test.each<[string, (source: FakeChapterEditSource) => void]>([
  [
    'is not returned',
    (source): void => {
      source.loadLines.mockResolvedValueOnce([])
    },
  ],
  [
    'cannot be loaded',
    (source): void => {
      source.loadLines.mockRejectedValueOnce(new Error('Network error'))
    },
  ],
])('saveLine reports when the saved line %s', async (_name, breakReload) => {
  const view = await renderWithDraft()
  breakReload(view.source)
  saveLine(view)
  await waitForStatus(view, 'failed')

  expect(currentState(view).lines[1].error).toBe(lineNotReloadedMessage)
  expect(currentState(view).lines[1].draft).toBe(draft)
})

test('a failed save can be repeated', async () => {
  const view = await renderWithDraft()
  view.source.saveLine.mockRejectedValueOnce(new Error('Conflict'))
  saveLine(view)
  await waitForStatus(view, 'failed')
  saveLine(view)
  await waitForStatus(view, 'ready')

  expect(view.source.saveLine).toHaveBeenCalledTimes(2)
  expect(currentState(view).lines[1].original?.number).toBe('2a')
})

test('saveLine does not start a second save while one is running', async () => {
  const view = await renderWithDraft()
  act(() => {
    view.result.current.context.actions.saveLine(1)
    view.result.current.context.actions.saveLine(1)
  })
  await waitForStatus(view, 'ready')

  expect(view.source.saveLine).toHaveBeenCalledTimes(1)
})

test('saveLine ignores lines that are not loaded', async () => {
  const source = createFakeChapterEditSource({ lines })
  source.loadLines.mockRejectedValueOnce(new Error('Network error'))
  const { result } = renderHook(() => useEditLite(source, outline, true))
  act(() => result.current.context.actions.saveLine(0))
  act(() => result.current.context.actions.ensureLines(1, 1))
  act(() => result.current.context.actions.saveLine(1))
  await waitForStatus({ source, result }, 'failed')
  act(() => result.current.context.actions.saveLine(1))

  expect(source.saveLine).not.toHaveBeenCalled()
  expect(result.current.state.lines[0]).toBeUndefined()
})
