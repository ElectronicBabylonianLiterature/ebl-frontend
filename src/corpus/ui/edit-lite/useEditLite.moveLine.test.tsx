import { act, waitFor } from '@testing-library/react'
import { chapterChangedMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  listLineNumbers,
  toSavedLine,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import { moveItem } from 'corpus/ui/edit-lite/lineMove'
import {
  createDeferred,
  Deferred,
  EditLiteHook,
  holdNextCall,
  moveAndWait,
  renderEditLiteHookWithDraft,
} from 'corpus/ui/edit-lite/useEditLite.testSupport'

const lines: readonly Line[] = buildEditLiteLines(6)
const draftPosition = 3
const draft: Line = setLineNumber(lines[draftPosition], '4a')
const savedDraft: Line = toSavedLine(draft)

function renderLoaded(loadedCount = 6): Promise<EditLiteHook> {
  return renderEditLiteHookWithDraft(lines, loadedCount, draftPosition, draft)
}

test.each<[string, number, number, number]>([
  ['down across the edited line', 0, 4, 2],
  ['up across the edited line', 5, 1, 4],
  ['down onto the place of the edited line', 2, 3, 2],
  ['up onto the place of the edited line', 4, 3, 4],
  ['down before the edited line', 0, 2, 3],
  ['up after the edited line', 5, 4, 3],
])(
  'after a line is moved %s the draft is saved to its own line',
  async (_name, from, to, newPosition) => {
    const view = await renderLoaded()
    const movedLines = moveItem(lines, from, to)
    await moveAndWait(view, from, to)

    expect(view.source.moveLine.mock.calls).toEqual([[from, to]])
    expect(movedLines[newPosition]).toBe(lines[draftPosition])
    expect(listLineNumbers(await view.source.loadLines(0, 6))).toEqual(
      listLineNumbers(movedLines),
    )
    expect(view.state().lines[newPosition]).toEqual({
      status: 'ready',
      original: lines[draftPosition],
      draft,
      error: null,
    })

    view.run((actions) => actions.saveLine(newPosition))
    await waitFor(() =>
      expect(view.state().outline.lines[newPosition].number).toBe('4a'),
    )
    const storedLines = await view.source.loadLines(0, 6)

    expect(view.source.saveLine.mock.calls).toEqual([
      [newPosition, lines[draftPosition], draft],
    ])
    expect(storedLines).toEqual(
      movedLines.map((line) =>
        line === lines[draftPosition] ? savedDraft : line,
      ),
    )
    expect(storedLines.filter((line) => !lines.includes(line))).toEqual([
      savedDraft,
    ])
    expect(view.state().lines[newPosition].original).toEqual(savedDraft)
  },
)

test('moveLine marks the line, moves it and tells the caller afterwards', async () => {
  const view = await renderLoaded()
  const held = holdNextCall(view.source.moveLine)
  const onMoved = jest.fn()
  view.run((actions) => actions.moveLine(draftPosition, 0, onMoved))

  expect(view.state().lines[draftPosition]).toEqual({
    status: 'moving',
    original: lines[draftPosition],
    draft,
    error: null,
  })
  expect(view.state().outline).toBe(view.outline)
  expect(onMoved).not.toHaveBeenCalled()

  await act(async () => held.resolve())
  await waitFor(() => expect(onMoved).toHaveBeenCalledTimes(1))

  expect(listLineNumbers(view.state().outline.lines)).toEqual([
    '4',
    '1',
    '2',
    '3',
    '5',
    '6',
  ])
  expect(view.state().outline.lines.map((line) => line.index)).toEqual([
    0, 1, 2, 3, 4, 5,
  ])
  expect(view.state().lines[0]).toEqual({
    status: 'ready',
    original: lines[draftPosition],
    draft,
    error: null,
  })
  expect(view.state().lines[1].original).toBe(lines[0])
  expect(view.source.loadLines).not.toHaveBeenCalled()
})

test.each<[string, Error | string, string]>([
  ['a conflict', new Error(chapterChangedMessage), chapterChangedMessage],
  [
    'a refusal of the server',
    new Error('Invalid extent: line 3 is before line 5'),
    'Invalid extent: line 3 is before line 5',
  ],
  ['a plain value', 'Forbidden', 'Forbidden'],
])(
  'a move that fails with %s leaves every line in its place',
  async (_name, rejection, message) => {
    const view = await renderLoaded()
    const linesBefore = view.state().lines
    const onMoved = jest.fn()
    view.source.moveLine.mockRejectedValueOnce(rejection)
    view.run((actions) => actions.moveLine(draftPosition, 0, onMoved))
    const failedLine = await view.waitForLine(draftPosition, 'failed')

    expect(failedLine).toEqual({
      status: 'failed',
      original: lines[draftPosition],
      draft,
      error: message,
    })
    expect(view.state().outline).toBe(view.outline)
    expect(view.state().layoutVersion).toBe(0)
    expect({ ...view.state().lines, [draftPosition]: null }).toEqual({
      ...linesBefore,
      [draftPosition]: null,
    })
    expect(onMoved).not.toHaveBeenCalled()

    await moveAndWait(view, draftPosition, 0, onMoved)

    expect(view.source.moveLine.mock.calls).toEqual([
      [draftPosition, 0],
      [draftPosition, 0],
    ])
    expect(view.state().lines[0].draft).toBe(draft)
    expect(view.state().lines[0].error).toBeNull()
    expect(onMoved).toHaveBeenCalledTimes(1)
  },
)

test.each<[string, (lines: Deferred<readonly Line[]>) => void]>([
  ['answered', (pending): void => pending.resolve([lines[4], lines[5]])],
  ['refused', (pending): void => pending.reject(new Error('Conflict'))],
])(
  'a request for lines that is %s after a move is dropped',
  async (_name, settle) => {
    const view = await renderLoaded(4)
    const pending = createDeferred<readonly Line[]>()
    view.source.loadLines.mockReturnValueOnce(pending.promise)
    view.run((actions) => actions.ensureLines(4, 2))
    await waitFor(() =>
      expect(view.source.loadLines).toHaveBeenCalledWith(4, 2),
    )
    await moveAndWait(view, 0, 5)

    expect(Object.keys(view.state().lines)).toEqual(['0', '1', '2', '5'])

    await act(async () => settle(pending))

    expect(Object.keys(view.state().lines)).toEqual(['0', '1', '2', '5'])
    expect(view.state().lines[5].original).toBe(lines[0])

    await view.load(3, 2)

    expect(view.state().lines[3].original).toBe(lines[4])
    expect(view.state().lines[4].original).toBe(lines[5])
    expect(view.state().lines[2].draft).toBe(draft)
  },
)
