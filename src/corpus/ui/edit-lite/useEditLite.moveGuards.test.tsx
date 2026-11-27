import { act, waitFor } from '@testing-library/react'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  createRecordedEditLiteStore,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import { moveItem } from 'corpus/ui/edit-lite/lineMove'
import { moveLine } from 'corpus/ui/edit-lite/lineSaving'
import { findLineActivity } from 'corpus/ui/edit-lite/lineStates'
import {
  createDeferred,
  EditLiteHook,
  holdNextCall,
  renderEditLiteHookWithDraft,
} from 'corpus/ui/edit-lite/useEditLite.testSupport'

const lines: readonly Line[] = buildEditLiteLines(6)
const draft: Line = setLineNumber(lines[3], '4a')

function renderLoaded(loadedCount = 6): Promise<EditLiteHook> {
  return renderEditLiteHookWithDraft(lines, loadedCount, 3, draft)
}

async function waitForLayout(view: EditLiteHook): Promise<void> {
  await waitFor(() => expect(view.state().layoutVersion).toBe(1))
}

test('only one line is moved at a time and nothing is saved or deleted meanwhile', async () => {
  const view = await renderLoaded()
  const held = holdNextCall(view.source.moveLine)
  const onMoved = jest.fn()
  view.run((actions) => actions.addLine())
  view.run((actions) => actions.moveLine(0, 2, onMoved))
  view.run((actions) => actions.moveLine(1, 0, onMoved))
  view.run((actions) => actions.saveLine(3))
  view.run((actions) => actions.saveLine(6))
  view.run((actions) => actions.deleteLine(1, jest.fn()))

  expect(view.source.moveLine.mock.calls).toEqual([[0, 2]])
  expect(view.source.saveLine).not.toHaveBeenCalled()
  expect(view.source.addLine).not.toHaveBeenCalled()
  expect(view.source.deleteLine).not.toHaveBeenCalled()
  expect(view.state().lines[3].status).toBe('ready')
  expect(view.state().lines[1].status).toBe('ready')
  expect(view.state().newLine?.status).toBe('ready')

  await act(async () => held.resolve())
  await waitForLayout(view)
  view.run((actions) => actions.saveLine(3))
  await waitFor(() => expect(view.state().outline.lines[3].number).toBe('4a'))

  expect(view.source.saveLine.mock.calls).toEqual([[3, lines[3], draft]])
  expect(onMoved).toHaveBeenCalledTimes(1)
})

test('the drafts of other lines can be edited while a line is moved', async () => {
  const view = await renderLoaded()
  const held = holdNextCall(view.source.moveLine)
  const laterDraft = setLineNumber(lines[1], '2a')
  view.run((actions) => actions.moveLine(0, 3, jest.fn()))
  view.run((actions) => actions.changeLine(1, laterDraft, lines[1]))
  await act(async () => held.resolve())
  await waitForLayout(view)

  expect(view.state().lines[0].draft).toBe(laterDraft)
  expect(view.state().lines[2].draft).toBe(draft)
  expect(view.state().lines[3].original).toBe(lines[0])
})

test.each<[string, (view: EditLiteHook) => void, () => void]>(
  ((): [string, (view: EditLiteHook) => void, () => void][] => {
    const saved = createDeferred<ChapterOutline>()
    const deleted = createDeferred<ChapterOutline>()
    const failure = new Error('Conflict')
    return [
      [
        'saved',
        (view): void => {
          view.source.saveLine.mockReturnValueOnce(saved.promise)
          view.run((actions) => actions.saveLine(3))
        },
        (): void => saved.reject(failure),
      ],
      [
        'deleted',
        (view): void => {
          view.source.deleteLine.mockReturnValueOnce(deleted.promise)
          view.run((actions) => actions.deleteLine(3, jest.fn()))
        },
        (): void => deleted.reject(failure),
      ],
    ]
  })(),
)('moveLine waits until no line is being %s', async (_name, start, finish) => {
  const view = await renderLoaded()
  start(view)
  view.run((actions) => actions.moveLine(0, 2, jest.fn()))

  expect(view.source.moveLine).not.toHaveBeenCalled()
  expect(view.state().lines[0].status).toBe('ready')

  await act(async () => finish())
  await view.waitForLine(3, 'failed')
  view.run((actions) => actions.moveLine(0, 2, jest.fn()))
  await waitForLayout(view)

  expect(view.source.moveLine.mock.calls).toEqual([[0, 2]])
})

test.each<[string, number, number]>([
  ['the unsaved new line', 6, 0],
  ['a place after the stored lines', 0, 6],
  ['a place before the first line', 0, -1],
  ['a line before the first line', -1, 2],
  ['a line far after the last line', 9, 0],
  ['a position that is not whole', 0, 1.5],
  ['the place where the line already is', 2, 2],
])('moveLine ignores %s', async (_name, from, to) => {
  const view = await renderLoaded()
  const onMoved = jest.fn()
  view.run((actions) => actions.addLine())
  const stateBefore = view.state()
  view.run((actions) => actions.moveLine(from, to, onMoved))

  expect(view.source.moveLine).not.toHaveBeenCalled()
  expect(view.state()).toBe(stateBefore)
  expect(onMoved).not.toHaveBeenCalled()
})

test('moveLine ignores lines that are not loaded', async () => {
  const view = await renderLoaded(4)
  const pending = createDeferred<readonly Line[]>()
  view.source.loadLines
    .mockRejectedValueOnce(new Error('Network error'))
    .mockReturnValueOnce(pending.promise)
  view.run((actions) => actions.ensureLines(4, 1))
  await view.waitForLine(4, 'failed')
  view.run((actions) => actions.ensureLines(5, 1))
  const stateBefore = view.state()
  view.run((actions) => actions.moveLine(4, 0, jest.fn()))
  view.run((actions) => actions.moveLine(5, 0, jest.fn()))

  expect(view.source.moveLine).not.toHaveBeenCalled()
  expect(view.state()).toBe(stateBefore)
  expect(view.state().lines[4].status).toBe('failed')
  expect(view.state().lines[5].status).toBe('loading')

  await act(async () => pending.resolve([lines[5]]))
  view.run((actions) => actions.moveLine(5, 0, jest.fn()))
  await waitForLayout(view)

  expect(view.source.moveLine.mock.calls).toEqual([[5, 0]])
})

test.each<[string, number, readonly Line[]]>([
  ['the order that was asked for', 1, moveItem(lines, 0, 2)],
  ['a line that differs', 1, [...moveItem(lines, 0, 2).slice(0, 5), draft]],
  ['another order', 1, moveItem(lines, 0, 4)],
  ['the old order', 1, lines],
  ['a line less', 0, lines.slice(1)],
  ['a line more', 0, [...lines, draft]],
])(
  'a move answered with %s is reported to the caller %i times',
  async (_name, reports, returnedLines) => {
    const view = await renderLoaded()
    const onMoved = jest.fn()
    view.source.moveLine.mockResolvedValueOnce(
      buildEditLiteOutline(returnedLines, 'revision-2'),
    )
    view.run((actions) => actions.moveLine(0, 2, onMoved))
    await waitForLayout(view)

    expect(onMoved).toHaveBeenCalledTimes(reports)
    expect(view.state().outline.revision).toBe('revision-2')
    expect(findLineActivity(view.state())).toBe('idle')
  },
)

test('the caller is told about the move in the step that moves the drafts', async () => {
  const { store, events } = createRecordedEditLiteStore(lines)
  await moveLine(store, 0, 2, () => {
    events.push(`moved with layout ${store.getState().layoutVersion}`)
  })
  await Promise.resolve()

  expect(events).toEqual([
    'moveStarted',
    'after moveStarted',
    'lineMoved',
    'moved with layout 1',
    'after lineMoved',
  ])
})
