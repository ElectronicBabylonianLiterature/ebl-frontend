import { createLineAlignment, Line } from 'corpus/domain/line'
import {
  buildAlignmentDraft,
  buildLemmatizationDraft,
  buildReadyAnnotation,
} from 'corpus/ui/edit-lite/annotationState.testSupport'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  buildLinesLoadedActions,
  reduceEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { createEditLiteState } from 'corpus/ui/edit-lite/editLiteReducer'
import {
  AnnotationDraft,
  EditLiteState,
  LineAnnotation,
  LineState,
} from 'corpus/ui/edit-lite/editLiteState'
import {
  annotateLine,
  buildLineLemmatization,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import {
  findLemmatizationDraftLine,
  loadingResource,
  readyResource,
  requestedAnnotation,
  storesLoadedValue,
  withOutdatedAnnotation,
} from 'corpus/ui/edit-lite/lineAnnotations'
import { readyLine } from 'corpus/ui/edit-lite/lineStates'

const lines: readonly Line[] = buildEditLiteLines(4)
const [line] = lines
const annotatedLine: Line = annotateLine(line)
const lemmatization = buildLineLemmatization(annotatedLine)
const alignmentDraft = buildAlignmentDraft(annotatedLine)

function withAnnotation(config: Partial<LineAnnotation>): LineState {
  return {
    ...readyLine(line),
    annotation: buildReadyAnnotation(annotatedLine, config),
  }
}

test('a draft that stores what is stored already is told from one that changes the line', () => {
  const annotation = buildReadyAnnotation(annotatedLine, {
    lemmas: readyResource(lemmatization),
  })
  const loadedAlignment: AnnotationDraft = {
    view: 'alignment',
    alignment: createLineAlignment(annotatedLine),
  }
  const loadedLemmas: AnnotationDraft = { view: 'lemmatization', lemmatization }

  expect(storesLoadedValue(annotation, loadedAlignment)).toBe(true)
  expect(storesLoadedValue(annotation, alignmentDraft)).toBe(false)
  expect(storesLoadedValue(annotation, loadedLemmas)).toBe(true)
  expect(storesLoadedValue(requestedAnnotation, loadedAlignment)).toBe(false)
  expect(
    storesLoadedValue(buildReadyAnnotation(annotatedLine), loadedLemmas),
  ).toBe(false)
  expect(
    storesLoadedValue(
      buildReadyAnnotation(annotatedLine, { lemmas: loadingResource }),
      loadedLemmas,
    ),
  ).toBe(false)
})

test('tokens that are older than the lemmas of the chapter are dropped or kept for their draft only', () => {
  const clean = withAnnotation({ lemmas: readyResource(lemmatization) })
  const drafted = withAnnotation({
    lemmas: readyResource(lemmatization),
    draft: alignmentDraft,
  })

  expect(withOutdatedAnnotation(readyLine(line))).toEqual(readyLine(line))
  expect(withOutdatedAnnotation(clean)).toEqual(readyLine(line))
  expect(withOutdatedAnnotation(drafted)).toEqual({
    ...readyLine(line),
    annotation: {
      tokens: readyResource(annotatedLine),
      lemmas: null,
      draft: alignmentDraft,
      isStale: false,
      isOutdated: true,
    },
  })
})

test('the line with unsaved lemmatization changes is named unless it is the open line', () => {
  const loaded: EditLiteState = reduceEditLite(
    createEditLiteState(buildEditLiteOutline(lines)),
    ...buildLinesLoadedActions(0, lines),
  )
  const withDraft = (index: number, draft: AnnotationDraft): LineState => ({
    ...loaded.lines[index],
    annotation: buildReadyAnnotation(annotateLine(lines[index]), { draft }),
  })
  const state: EditLiteState = {
    ...loaded,
    lines: {
      ...loaded.lines,
      1: withDraft(1, buildAlignmentDraft(annotateLine(lines[1]))),
      3: withDraft(3, buildLemmatizationDraft(annotateLine(lines[3]))),
    },
  }

  expect(findLemmatizationDraftLine(state, 0)).toBe('4')
  expect(findLemmatizationDraftLine(state, 1)).toBe('4')
  expect(findLemmatizationDraftLine(state, 3)).toBeNull()
  expect(findLemmatizationDraftLine(loaded, 0)).toBeNull()
})
