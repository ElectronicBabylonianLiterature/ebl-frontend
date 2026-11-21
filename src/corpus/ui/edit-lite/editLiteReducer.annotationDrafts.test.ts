import { lineChangedOnServerMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { Line } from 'corpus/domain/line'
import {
  buildAnnotationStates,
  buildReadyAnnotation,
} from 'corpus/ui/edit-lite/annotationState.testSupport'
import {
  buildEditLiteOutline,
  buildLineSavedActions,
  reduceEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { isLineDirty } from 'corpus/ui/edit-lite/editLiteReducer'
import {
  EditLiteAction,
  EditLiteState,
  LineState,
} from 'corpus/ui/edit-lite/editLiteState'
import { readyResource } from 'corpus/ui/edit-lite/lineAnnotations'
import {
  setLineNumber,
  setLineTranslation,
} from 'corpus/ui/edit-lite/lineDraft'
import { moveItem } from 'corpus/ui/edit-lite/lineMove'
import {
  findUnsavedView,
  hasLineChanged,
  hasTextChanged,
  hasUnsavedChanges,
  readyLine,
} from 'corpus/ui/edit-lite/lineStates'

const { lines, annotatedLine, lemmatization, draft, cleanState, draftState } =
  buildAnnotationStates(5, 1)
const textDraft: Line = setLineNumber(lines[1], '2a')
const changedLines: readonly Line[] = lines.map((line, index) =>
  index === 1 ? setLineTranslation(line, '#tr.en: changed') : line,
)
const changeAnnotation: EditLiteAction = {
  type: 'annotationChanged',
  index: 1,
  line: annotatedLine,
  draft,
}
const cleanAnnotation = buildReadyAnnotation(annotatedLine, {
  lemmas: readyResource(lemmatization),
})
const draftLine: LineState = draftState.lines[1]
const textState: EditLiteState = reduceEditLite(cleanState, {
  type: 'lineChanged',
  index: 1,
  draft: textDraft,
  original: lines[1],
})
const changedOutline = buildEditLiteOutline(changedLines, 'revision-2')

function staleState(): EditLiteState {
  return reduceEditLite(draftState, {
    type: 'outlineReplaced',
    outline: changedOutline,
  })
}

test('an annotation draft counts as an unsaved change of its line', () => {
  expect(hasLineChanged(draftLine)).toBe(true)
  expect(hasTextChanged(draftLine)).toBe(false)
  expect(isLineDirty(draftLine)).toBe(true)
  expect(hasUnsavedChanges(draftState)).toBe(true)
  expect(findUnsavedView(draftLine)).toBe('alignment')
  expect(findUnsavedView(textState.lines[1])).toBe('text')
  expect(findUnsavedView(cleanState.lines[1])).toBeNull()
  expect(hasUnsavedChanges(cleanState)).toBe(false)
  expect(isLineDirty(cleanState.lines[1])).toBe(false)
})

test('one line holds one kind of unsaved change', () => {
  const lateTextEdit: EditLiteAction = {
    type: 'lineChanged',
    index: 1,
    draft: textDraft,
    original: lines[1],
  }

  expect(reduceEditLite(textState, changeAnnotation)).toBe(textState)
  expect(reduceEditLite(draftState, lateTextEdit)).toBe(draftState)
  expect(textState.lines[1].annotation).toBe(cleanState.lines[1].annotation)
})

test('a reset drops the draft and keeps the tokens and lemmas', () => {
  const failedState = reduceEditLite(draftState, {
    type: 'saveFailed',
    index: 1,
    error: 'refused',
  })
  const resetState = reduceEditLite(failedState, {
    type: 'lineReset',
    index: 1,
  })

  expect(failedState.lines[1]).toEqual({
    ...draftLine,
    status: 'failed',
    error: 'refused',
  })
  expect(resetState.lines[1]).toEqual({
    ...readyLine(lines[1]),
    annotation: cleanAnnotation,
  })
  expect(resetState.lines[1].annotation?.tokens.value).toBe(annotatedLine)
})

test('a reset of text changes keeps the tokens of the unchanged stored line', () => {
  const resetState = reduceEditLite(textState, { type: 'lineReset', index: 1 })

  expect(resetState.lines[1]).toEqual(cleanState.lines[1])
  expect(
    reduceEditLite(cleanState, { type: 'lineReset', index: 0 }).lines[0],
  ).toEqual(readyLine(lines[0]))
})

test('a save of the line drops its tokens, lemmas and draft', () => {
  const savedState = reduceEditLite(
    draftState,
    ...buildLineSavedActions(1, buildEditLiteOutline(lines, 'r2'), lines[1]),
  )
  const reloadedState = reduceEditLite(
    draftState,
    ...buildLineSavedActions(1, buildEditLiteOutline(lines, 'r2'), null),
  )

  expect(savedState.lines[1]).toEqual(readyLine(lines[1]))
  expect(savedState.lines[1]).not.toHaveProperty('annotation')
  expect(reloadedState.lines).not.toHaveProperty('1')
})

test('lines that arrive for a loaded position leave its tokens alone', () => {
  const state = reduceEditLite(draftState, {
    type: 'linesLoaded',
    offset: 0,
    lines: changedLines.slice(0, 3),
  })

  expect(state).toBe(draftState)
})

test('a draft on a line that changed on the server is flagged and cannot be changed further', () => {
  const state = staleState()

  expect(state.lines[1]).toEqual({
    ...draftLine,
    status: 'failed',
    error: lineChangedOnServerMessage,
    annotation: { ...cleanAnnotation, draft, isStale: true },
  })
  expect(reduceEditLite(state, changeAnnotation)).toBe(state)
  expect(state.lines[0]).toBe(draftState.lines[0])
})

test('a reset of a draft on a changed line drops the entry so that it is loaded again', () => {
  const state = staleState()
  const movedState = reduceEditLite(
    state,
    { type: 'moveStarted', index: 1 },
    {
      type: 'lineMoved',
      from: 1,
      to: 0,
      outline: buildEditLiteOutline(moveItem(changedLines, 1, 0), 'r3'),
    },
  )

  expect(
    reduceEditLite(state, { type: 'lineReset', index: 1 }).lines,
  ).not.toHaveProperty('1')
  expect(movedState.lines[0]).toMatchObject({ status: 'ready', error: null })
  expect(movedState.lines[0].annotation?.isStale).toBe(true)
  expect(
    reduceEditLite(movedState, { type: 'lineReset', index: 0 }).lines,
  ).not.toHaveProperty('0')
})

test('clean tokens of a line that changed on the server are dropped', () => {
  const outline: EditLiteAction = {
    type: 'outlineReplaced',
    outline: changedOutline,
  }

  expect(reduceEditLite(cleanState, outline).lines).not.toHaveProperty('1')
  expect(reduceEditLite(textState, outline).lines[1]).toEqual({
    status: 'failed',
    original: lines[1],
    draft: textDraft,
    error: lineChangedOnServerMessage,
  })
  expect(
    reduceEditLite(draftState, {
      type: 'outlineReplaced',
      outline: buildEditLiteOutline(lines, 'revision-2'),
    }).lines[1],
  ).toBe(draftLine)
})
