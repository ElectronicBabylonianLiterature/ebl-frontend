import { act, waitFor } from '@testing-library/react'
import { EditStatus, Line } from 'corpus/domain/line'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  setLineNumber,
  setLineTranslation,
} from 'corpus/ui/edit-lite/lineDraft'
import { loadingLine } from 'corpus/ui/edit-lite/lineStates'
import {
  EditLiteHook,
  holdNextCall,
  renderEditLiteHook,
} from 'corpus/ui/edit-lite/useEditLite.testSupport'

const lines: readonly Line[] = buildEditLiteLines()

async function renderWithNewLine(): Promise<EditLiteHook> {
  const view = renderEditLiteHook(lines)
  await view.load(2, 1)
  view.run((actions) => actions.addLine())
  view.source.loadLines.mockClear()
  return view
}

function newLineOf(view: EditLiteHook): Line {
  return view.state().newLine?.draft as Line
}

test('addLine continues the loaded last line like the classic editor', async () => {
  const view = renderEditLiteHook(lines)
  await view.load(2, 1)
  view.run((actions) => actions.addLine())

  expect(view.state().newLine?.status).toBe('ready')
  expect(newLineOf(view)).toMatchObject({
    number: '4',
    status: EditStatus.NEW,
    translation: '',
  })
  expect(newLineOf(view).variants).toHaveLength(1)
  expect(newLineOf(view).variants[0].reconstruction).toBe('%n ')
  expect(newLineOf(view).variants[0].manuscripts).toMatchObject([
    { manuscriptId: 2, labels: [], number: '9', atf: '' },
  ])
  expect(view.source.loadLines).toHaveBeenCalledTimes(1)
  expect(view.state().outline).toBe(view.outline)
})

test('addLine continues the unsaved draft of the last line', async () => {
  const view = renderEditLiteHook(lines)
  await view.load(2, 1)
  view.run((actions) => actions.changeLine(2, setLineNumber(lines[2], '41')))
  view.run((actions) => actions.addLine())

  expect(newLineOf(view).number).toBe('42')
})

test('addLine loads the last line first when it is not loaded yet', async () => {
  const view = renderEditLiteHook(lines)
  view.run((actions) => actions.addLine())

  expect(view.state().newLine).toBe(loadingLine)

  await waitFor(() => expect(view.state().newLine?.status).toBe('ready'))

  expect(view.source.loadLines.mock.calls).toEqual([[2, 1]])
  expect(newLineOf(view).number).toBe('4')
  expect(view.state().lines).toEqual({})
})

test('a new line discarded while the last line loads does not come back', async () => {
  const view = renderEditLiteHook(lines)
  const loaded = holdNextCall(view.source.loadLines)
  view.run((actions) => actions.addLine())
  view.run((actions) => actions.resetLine(3))

  await act(async () => loaded.resolve())

  expect(view.state().newLine).toBeNull()
})

test.each<[string, (view: EditLiteHook) => void]>([
  [
    'cannot be loaded',
    (view): void => {
      view.source.loadLines.mockRejectedValueOnce(new Error('Network error'))
    },
  ],
  [
    'is not returned',
    (view): void => {
      view.source.loadLines.mockResolvedValueOnce([])
    },
  ],
])(
  'addLine starts an empty line when the last line %s',
  async (_name, fail) => {
    const view = renderEditLiteHook(lines)
    fail(view)
    view.run((actions) => actions.addLine())
    await waitFor(() => expect(view.state().newLine?.status).toBe('ready'))

    expect(newLineOf(view)).toMatchObject({
      number: '',
      status: EditStatus.NEW,
    })
    expect(newLineOf(view).variants[0].manuscripts).toEqual([])
  },
)

test('addLine starts an empty line in a chapter without lines', () => {
  const view = renderEditLiteHook([])
  view.run((actions) => actions.addLine())

  expect(newLineOf(view)).toMatchObject({ number: '', status: EditStatus.NEW })
  expect(newLineOf(view).variants[0].reconstruction).toBe('%n ')
  expect(view.source.loadLines).not.toHaveBeenCalled()
})

test('addLine keeps the new line that is already there', async () => {
  const view = await renderWithNewLine()
  const draft = setLineNumber(newLineOf(view), '4a')
  view.run((actions) => actions.changeLine(3, draft))
  view.run((actions) => actions.addLine())

  expect(newLineOf(view)).toBe(draft)
})

test('resetLine discards the new line', async () => {
  const view = await renderWithNewLine()
  view.run((actions) => actions.resetLine(3))

  expect(view.state().newLine).toBeNull()
  expect(view.source.addLine).not.toHaveBeenCalled()
})

test('saveLine posts the new line and makes it the last line of the chapter', async () => {
  const view = await renderWithNewLine()
  const draft = setLineTranslation(newLineOf(view), '#tr.en: A new line')
  view.run((actions) => actions.changeLine(3, draft))
  const saved = holdNextCall(view.source.addLine)
  view.run((actions) => actions.saveLine(3))

  expect(view.state().newLine?.status).toBe('saving')
  expect(view.source.addLine).toHaveBeenCalledWith(draft)

  view.run((actions) => actions.saveLine(3))
  await act(async () => saved.resolve())

  expect(view.source.addLine).toHaveBeenCalledTimes(1)
  expect(view.source.saveLine).not.toHaveBeenCalled()
  expect(view.source.loadLines).not.toHaveBeenCalled()
  expect(view.state().newLine).toBeNull()
  expect(view.state().lines[3]).toBeUndefined()
  expect(view.state().outline.lines).toHaveLength(4)
  expect(view.state().outline.lines[3]).toMatchObject({
    index: 3,
    number: '4',
    translation: '#tr.en: A new line',
  })

  await view.load(3, 1)
  const savedLine = view.state().lines[3]

  expect(view.source.loadLines.mock.calls).toEqual([[3, 1]])
  expect(savedLine.original).toEqual({ ...draft, status: EditStatus.CLEAN })
  expect(savedLine.draft).toBe(savedLine.original)
})

test.each<[string, Error | string, string]>([
  ['an error', new Error('Invalid line number'), 'Invalid line number'],
  ['a plain value', 'Unprocessable', 'Unprocessable'],
])(
  'saveLine keeps the new line when adding fails with %s',
  async (_name, rejection, message) => {
    const view = await renderWithNewLine()
    const draft = newLineOf(view)
    view.source.addLine.mockRejectedValueOnce(rejection)
    view.run((actions) => actions.saveLine(3))
    await waitFor(() => expect(view.state().newLine?.status).toBe('failed'))

    expect(view.state().newLine).toEqual({
      status: 'failed',
      original: draft,
      draft,
      error: message,
    })
    expect(view.state().outline).toBe(view.outline)
    expect(view.source.loadLines).not.toHaveBeenCalled()

    view.run((actions) => actions.saveLine(3))
    await waitFor(() => expect(view.state().newLine).toBeNull())

    expect(view.source.addLine).toHaveBeenCalledTimes(2)
    expect(view.state().outline.lines).toHaveLength(4)
  },
)

test('saveLine does not add the line twice when the saved line is not loaded yet', async () => {
  const view = await renderWithNewLine()
  view.run((actions) => actions.saveLine(3))
  await waitFor(() => expect(view.state().newLine).toBeNull())

  expect(view.state().outline.lines).toHaveLength(4)
  expect(view.state().lines[3]).toBeUndefined()

  view.run((actions) => actions.saveLine(3))
  await view.load(3, 1)

  expect(view.source.addLine).toHaveBeenCalledTimes(1)
  expect(view.source.saveLine).not.toHaveBeenCalled()
  expect(view.state().lines[3].original?.number).toBe('4')
})
