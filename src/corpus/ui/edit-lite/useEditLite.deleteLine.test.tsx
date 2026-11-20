import { act, waitFor } from '@testing-library/react'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import {
  createDeferred,
  Deferred,
  EditLiteHook,
  holdNextCall,
  renderEditLiteHook,
} from 'corpus/ui/edit-lite/useEditLite.testSupport'

const lines: readonly Line[] = buildEditLiteLines(6)
const draft: Line = setLineNumber(lines[3], '4a')

async function renderLoaded(): Promise<EditLiteHook> {
  const view = renderEditLiteHook(lines)
  await view.load(0, 4)
  view.run((actions) => actions.changeLine(3, draft))
  view.source.loadLines.mockClear()
  return view
}

test('deleteLine removes the line and keeps the drafts on their lines', async () => {
  const view = await renderLoaded()
  const held = holdNextCall(view.source.deleteLine)
  view.run((actions) => actions.deleteLine(1))

  expect(view.state().lines[1].status).toBe('deleting')
  expect(view.source.deleteLine.mock.calls).toEqual([[1]])

  await act(async () => held.resolve())
  await waitFor(() => expect(view.state().outline.lines).toHaveLength(5))

  expect(view.state().outline.lines.map((line) => line.number)).toEqual([
    '1',
    '3',
    '4',
    '5',
    '6',
  ])
  expect(Object.keys(view.state().lines)).toEqual(['0', '1', '2'])
  expect(view.state().lines[0].original).toBe(lines[0])
  expect(view.state().lines[1].original).toBe(lines[2])
  expect(view.state().lines[2]).toEqual({
    status: 'ready',
    original: lines[3],
    draft,
    error: null,
  })
  expect(view.source.loadLines).not.toHaveBeenCalled()
})

test.each<[string, Error | string, string]>([
  [
    'an error',
    new Error('The chapter was changed.'),
    'The chapter was changed.',
  ],
  ['a plain value', 'Forbidden', 'Forbidden'],
])(
  'deleteLine keeps the line when deleting fails with %s',
  async (_name, rejection, message) => {
    const view = await renderLoaded()
    view.source.deleteLine.mockRejectedValueOnce(rejection)
    view.run((actions) => actions.deleteLine(3))
    const failedLine = await view.waitForLine(3, 'failed')

    expect(failedLine).toEqual({
      status: 'failed',
      original: lines[3],
      draft,
      error: message,
    })
    expect(view.state().outline).toBe(view.outline)
    expect(view.state().layoutVersion).toBe(0)
  },
)

test('deleteLine ignores lines that are not loaded', async () => {
  const view = await renderLoaded()
  view.run((actions) => actions.deleteLine(5))
  view.run((actions) => actions.deleteLine(6))

  expect(view.source.deleteLine).not.toHaveBeenCalled()
  expect(view.state().lines[5]).toBeUndefined()
})

test('only one line is deleted at a time and nothing is saved meanwhile', async () => {
  const view = await renderLoaded()
  const held = holdNextCall(view.source.deleteLine)
  view.run((actions) => actions.deleteLine(1))
  view.run((actions) => actions.deleteLine(2))
  view.run((actions) => actions.saveLine(3))

  expect(view.source.deleteLine.mock.calls).toEqual([[1]])
  expect(view.source.saveLine).not.toHaveBeenCalled()
  expect(view.state().lines[3].status).toBe('ready')

  await act(async () => held.resolve())
  await waitFor(() => expect(view.state().outline.lines).toHaveLength(5))
  view.run((actions) => actions.saveLine(2))
  await waitFor(() => expect(view.state().outline.lines[2].number).toBe('4a'))

  expect(view.source.saveLine).toHaveBeenCalledWith(2, lines[3], draft)
})

test('deleteLine waits until no line is being saved', async () => {
  const view = await renderLoaded()
  const saved = createDeferred<ChapterOutline>()
  view.source.saveLine.mockReturnValueOnce(saved.promise)
  view.run((actions) => actions.saveLine(3))
  view.run((actions) => actions.deleteLine(1))

  expect(view.source.deleteLine).not.toHaveBeenCalled()
  expect(view.state().lines[1].status).toBe('ready')

  await act(async () => saved.reject(new Error('Conflict')))
  await view.waitForLine(3, 'failed')
  view.run((actions) => actions.deleteLine(1))
  await waitFor(() => expect(view.state().outline.lines).toHaveLength(5))

  expect(view.source.deleteLine.mock.calls).toEqual([[1]])
})

test.each<[string, (lines: Deferred<readonly Line[]>) => void]>([
  ['answered', (pending): void => pending.resolve([lines[4], lines[5]])],
  ['refused', (pending): void => pending.reject(new Error('Conflict'))],
])(
  'a request for lines that is %s after a deletion is dropped',
  async (_name, settle) => {
    const view = await renderLoaded()
    const pending = createDeferred<readonly Line[]>()
    view.source.loadLines.mockReturnValueOnce(pending.promise)
    view.run((actions) => actions.ensureLines(4, 2))
    await waitFor(() =>
      expect(view.source.loadLines).toHaveBeenCalledWith(4, 2),
    )
    view.run((actions) => actions.deleteLine(1))
    await waitFor(() => expect(view.state().outline.lines).toHaveLength(5))

    expect(Object.keys(view.state().lines)).toEqual(['0', '1', '2'])

    await act(async () => settle(pending))

    expect(Object.keys(view.state().lines)).toEqual(['0', '1', '2'])

    await view.load(3, 2)

    expect(view.state().lines[3].original).toBe(lines[4])
    expect(view.state().lines[4].original).toBe(lines[5])
  },
)
