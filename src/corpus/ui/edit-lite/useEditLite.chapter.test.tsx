import { act } from '@testing-library/react'
import { ImportedLines } from 'corpus/ui/edit-lite/EditLiteContext'
import { Line } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'
import {
  buildEditLiteLines,
  createFakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'
import {
  EditLiteHook,
  renderEditLiteHook,
} from 'corpus/ui/edit-lite/useEditLite.testSupport'

const lines: readonly Line[] = buildEditLiteLines()
const draft: Line = setLineNumber(lines[1], '2a')
const manuscripts: readonly Manuscript[] = [
  new Manuscript({ id: 1, siglumDisambiguator: '9', museumNumber: 'K.1' }),
]

async function importLines(
  view: EditLiteHook,
  atf: string,
): Promise<ImportedLines | null> {
  let imported: ImportedLines | null = null
  await act(async () => {
    imported = await view.actions().importLines(atf)
  })
  return imported
}

async function renderWithDraft(): Promise<EditLiteHook> {
  const view = renderEditLiteHook(lines)
  await view.load(0, 3)
  view.run((actions) => actions.changeLine(1, draft))
  view.run((actions) => actions.addLine())
  return view
}

test.each([
  [true, true, true],
  [false, false, false],
])(
  'the context says whether the page may be edited: %s',
  (canWrite, expectedWrite, expectedSave) => {
    const view = renderEditLiteHook(lines, undefined, canWrite)

    expect(view.result.current.context.canWrite).toBe(expectedWrite)
    expect(view.result.current.context.canSave).toBe(expectedSave)
  },
)

test('a writer with a read-only source may edit but not save', () => {
  const source = createFakeChapterEditSource({ kind: 'legacy', lines })
  const view = renderEditLiteHook(lines, source)

  expect(view.result.current.context.canWrite).toBe(true)
  expect(view.result.current.context.canSave).toBe(false)
})

test('importLines appends the imported lines and keeps the drafts', async () => {
  const view = await renderWithDraft()
  const newLine = view.state().newLine
  const imported = await importLines(view, '4. kur\n\n5. ra\n')

  expect(imported).toEqual({ firstIndex: 3, count: 2 })
  expect(view.state().outline.lines).toHaveLength(5)
  expect(view.source.importLines.mock.calls).toEqual([['4. kur\n\n5. ra\n']])
  expect(view.state().outline.lines[3].variants[0].reconstruction).toBe(
    '4. kur',
  )
  expect(view.state().outline.lines[1]).toBe(view.outline.lines[1])
  expect(view.state().lines[1].draft).toBe(draft)
  expect(view.state().newLine).toBe(newLine)
})

test('importLines reports an import that added nothing', async () => {
  const view = await renderWithDraft()
  const imported = await importLines(view, '\n')

  expect(imported).toEqual({ firstIndex: 3, count: 0 })
  expect(view.source.importLines).toHaveBeenCalledTimes(1)
})

test.each<[string, Error | string, string]>([
  ['an error', new Error('Invalid ATF at line 2'), 'Invalid ATF at line 2'],
  ['a plain value', 'Unprocessable', 'Unprocessable'],
])(
  'importLines rejects with the message of %s and changes nothing',
  async (_name, rejection, message) => {
    const view = await renderWithDraft()
    const state = view.state()
    view.source.importLines.mockRejectedValueOnce(rejection)

    await expect(view.actions().importLines('1. kur')).rejects.toEqual(
      new Error(message),
    )
    expect(view.state()).toBe(state)
  },
)

test('saveManuscripts replaces the outline and keeps the drafts', async () => {
  const view = await renderWithDraft()
  view.run((actions) => actions.reportUnsavedManuscripts(true))

  expect(view.state().hasUnsavedManuscripts).toBe(true)

  await act(() => view.actions().saveManuscripts(manuscripts, ['K.2']))

  expect(view.state().manuscriptsVersion).toBe(1)
  expect(view.source.saveManuscripts.mock.calls).toEqual([
    [manuscripts, ['K.2']],
  ])
  expect(view.state().outline.manuscripts).toEqual([
    {
      id: 1,
      siglum: manuscripts[0].siglum,
      museumNumber: 'K.1',
      accession: '',
    },
  ])
  expect(manuscripts[0].siglum).toMatch(/NA9$/)
  expect(view.result.current.context.manuscripts).toBe(
    view.state().outline.manuscripts,
  )
  expect(view.state().outline.uncertainFragments).toEqual(['K.2'])
  expect(view.state().outline.lines).toBe(view.outline.lines)
  expect(view.state().lines[1].draft).toBe(draft)
  expect(view.state().newLine).not.toBeNull()
  expect(view.state().hasUnsavedManuscripts).toBe(false)
})

test.each<[string, Error | string, string]>([
  ['an error', new Error('Duplicate sigla'), 'Duplicate sigla'],
  ['a plain value', 'Unprocessable', 'Unprocessable'],
])(
  'saveManuscripts rejects with the message of %s and changes nothing',
  async (_name, rejection, message) => {
    const view = await renderWithDraft()
    view.run((actions) => actions.reportUnsavedManuscripts(true))
    const state = view.state()
    view.source.saveManuscripts.mockRejectedValueOnce(rejection)

    await expect(
      view.actions().saveManuscripts(manuscripts, []),
    ).rejects.toEqual(new Error(message))
    expect(view.state()).toBe(state)
  },
)

test('reportUnsavedManuscripts tracks the edits of the manuscripts tab', async () => {
  const view = renderEditLiteHook(lines)
  const { context } = view.result.current
  view.run((actions) => actions.reportUnsavedManuscripts(true))

  expect(view.state().hasUnsavedManuscripts).toBe(true)
  expect(view.result.current.context).toBe(context)

  view.run((actions) => actions.reportUnsavedManuscripts(false))

  expect(view.state().hasUnsavedManuscripts).toBe(false)
})
