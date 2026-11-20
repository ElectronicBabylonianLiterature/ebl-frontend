import { lineChangedOnServerMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { createLine, Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  createEditLiteState,
  editLiteReducer,
} from 'corpus/ui/edit-lite/editLiteReducer'
import {
  EditLiteAction,
  EditLiteState,
} from 'corpus/ui/edit-lite/editLiteState'
import { setLineNumber } from 'corpus/ui/edit-lite/lineDraft'

const lines: readonly Line[] = buildEditLiteLines()
const draft: Line = setLineNumber(lines[1], '2a')
const newLine: Line = setLineNumber(lines[2], '4')
const importedLines: readonly Line[] = [
  ...lines,
  createLine({ number: '4' }),
  createLine({ number: '5' }),
]
const loadedState: EditLiteState = reduce(
  createEditLiteState({
    ...buildEditLiteOutline(lines),
    uncertainFragments: ['K.1'],
  }),
  { type: 'linesLoaded', offset: 0, lines },
  { type: 'lineChanged', index: 1, draft },
  { type: 'lineAdded', line: newLine },
  { type: 'manuscriptsEdited', hasUnsaved: true },
)
const importedOutline: ChapterOutline = {
  ...buildEditLiteOutline(importedLines, 'revision-2'),
  uncertainFragments: ['K.1'],
}
const manuscriptsOutline: ChapterOutline = {
  ...buildEditLiteOutline(lines, 'revision-3'),
  uncertainFragments: ['K.1', 'BM.2'],
  manuscripts: [
    { id: 1, siglum: 'NinNA9', museumNumber: 'K.5419.C', accession: '' },
    loadedState.outline.manuscripts[1],
  ],
}

function reduce(
  state: EditLiteState,
  ...actions: readonly EditLiteAction[]
): EditLiteState {
  return actions.reduce(editLiteReducer, state)
}

test('outlineReplaced appends the imported lines and keeps what was loaded', () => {
  const state = reduce(loadedState, {
    type: 'outlineReplaced',
    outline: importedOutline,
  })

  expect(state.outline.revision).toBe('revision-2')
  expect(state.outline.lines.map((line) => line.number)).toEqual([
    '1',
    '2',
    '3',
    '4',
    '5',
  ])
  expect(state.outline.lines[2]).toBe(loadedState.outline.lines[2])
  expect(state.outline.manuscripts).toBe(loadedState.outline.manuscripts)
  expect(state.outline.uncertainFragments).toBe(
    loadedState.outline.uncertainFragments,
  )
  expect(state.lines).toEqual(loadedState.lines)
  expect(state.lines[1]).toBe(loadedState.lines[1])
  expect(state.lines[1].draft).toBe(draft)
})

test('outlineReplaced keeps the unsaved new line behind the imported lines', () => {
  const state = reduce(loadedState, {
    type: 'outlineReplaced',
    outline: importedOutline,
  })
  const changedState = reduce(state, {
    type: 'lineChanged',
    index: 5,
    draft: setLineNumber(newLine, '6'),
  })

  expect(state.newLine).toBe(loadedState.newLine)
  expect(changedState.newLine?.draft?.number).toBe('6')
  expect(changedState.lines).toBe(state.lines)
  expect(state.manuscriptsVersion).toBe(0)
  expect(state.hasUnsavedManuscripts).toBe(true)
})

test('outlineReplaced flags the draft of a line that the new outline changed', () => {
  const state = reduce(loadedState, {
    type: 'outlineReplaced',
    outline: buildEditLiteOutline([
      lines[0],
      setLineNumber(lines[1], '2b'),
      setLineNumber(lines[2], '3b'),
    ]),
  })

  expect(Object.keys(state.lines)).toEqual(['0', '1'])
  expect(state.lines[1]).toEqual({
    status: 'failed',
    original: lines[1],
    draft,
    error: lineChangedOnServerMessage,
  })
})

test('outlineReplaced leaves a line alone while it is being deleted', () => {
  const deletingState = reduce(loadedState, { type: 'deleteStarted', index: 2 })
  const state = reduce(deletingState, {
    type: 'outlineReplaced',
    outline: buildEditLiteOutline([
      lines[0],
      lines[1],
      setLineNumber(lines[2], '3b'),
    ]),
  })

  expect(state.lines[2]).toBe(deletingState.lines[2])
})

test('manuscriptsSaved takes over the sigla and the uncertain fragments', () => {
  const state = reduce(loadedState, {
    type: 'manuscriptsSaved',
    outline: manuscriptsOutline,
  })

  expect(state.outline.revision).toBe('revision-3')
  expect(state.outline.manuscripts[0].siglum).toBe('NinNA9')
  expect(state.outline.manuscripts[1]).toBe(loadedState.outline.manuscripts[1])
  expect(state.outline.uncertainFragments).toEqual(['K.1', 'BM.2'])
  expect(state.outline.lines).toBe(loadedState.outline.lines)
})

test('manuscriptsSaved keeps the lines and counts the save', () => {
  const state = reduce(loadedState, {
    type: 'manuscriptsSaved',
    outline: manuscriptsOutline,
  })

  expect(state.lines).toEqual(loadedState.lines)
  expect(state.lines[1].draft).toBe(draft)
  expect(state.newLine).toBe(loadedState.newLine)
  expect(state.manuscriptsVersion).toBe(1)
  expect(state.hasUnsavedManuscripts).toBe(false)
  expect(
    reduce(state, { type: 'manuscriptsSaved', outline: manuscriptsOutline })
      .manuscriptsVersion,
  ).toBe(2)
})

test('manuscriptsEdited remembers whether the manuscripts have unsaved edits', () => {
  const cleanState = reduce(loadedState, {
    type: 'manuscriptsEdited',
    hasUnsaved: false,
  })

  expect(cleanState.hasUnsavedManuscripts).toBe(false)
  expect(cleanState.lines).toBe(loadedState.lines)
  expect(
    reduce(loadedState, { type: 'manuscriptsEdited', hasUnsaved: true }),
  ).toBe(loadedState)
})
