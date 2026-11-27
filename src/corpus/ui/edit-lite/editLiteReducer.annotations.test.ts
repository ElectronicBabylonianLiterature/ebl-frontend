import { Line } from 'corpus/domain/line'
import {
  buildAlignmentDraft,
  buildLemmasLoadedActions,
  buildLemmatizationDraft,
  buildReadyAnnotation,
  buildTokensFailedActions,
  buildTokensLoadedActions,
} from 'corpus/ui/edit-lite/annotationState.testSupport'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  buildLinesFailedActions,
  buildLinesLoadedActions,
  reduceEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  createEditLiteState,
  editLiteReducer,
} from 'corpus/ui/edit-lite/editLiteReducer'
import {
  AnnotationDraft,
  EditLiteAction,
  EditLiteState,
} from 'corpus/ui/edit-lite/editLiteState'
import {
  annotateLine,
  buildLineLemmatization,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import {
  failedResource,
  loadingResource,
  readyResource,
  requestedAnnotation,
} from 'corpus/ui/edit-lite/lineAnnotations'
import { readyLine } from 'corpus/ui/edit-lite/lineStates'

const lines: readonly Line[] = buildEditLiteLines(4)
const annotatedLine: Line = annotateLine(lines[1])
const otherAnnotatedLine: Line = annotateLine(lines[1])
const lemmatization = buildLineLemmatization(annotatedLine)
const alignmentDraft = buildAlignmentDraft(annotatedLine)
const lemmatizationDraft = buildLemmatizationDraft(annotatedLine)
const loadedState: EditLiteState = reduceEditLite(
  createEditLiteState(buildEditLiteOutline(lines)),
  ...buildLinesLoadedActions(0, lines.slice(0, 3)),
  ...buildLinesFailedActions([3], 'refused'),
)
const requestTokens: EditLiteAction = { type: 'annotationRequested', index: 1 }
const requestLemmas: EditLiteAction = { type: 'lemmasRequested', index: 1 }
const tokensState: EditLiteState = reduceEditLite(
  loadedState,
  ...buildTokensLoadedActions(1, lines[1], annotatedLine),
)
const lemmasState: EditLiteState = reduceEditLite(
  tokensState,
  ...buildLemmasLoadedActions(1, annotatedLine, lemmatization),
)

function changeAnnotation(
  line: Line = annotatedLine,
  draft: AnnotationDraft = alignmentDraft,
): EditLiteAction {
  return { type: 'annotationChanged', index: 1, line, draft }
}

function settleTokens(original: Line): EditLiteAction {
  return {
    type: 'annotationSettled',
    original,
    tokens: readyResource(annotatedLine),
  }
}

function settleLemmas(line: Line): EditLiteAction {
  return {
    type: 'lemmasSettled',
    line,
    lemmas: readyResource(lemmatization),
  }
}

test('requested tokens are loading on the entry of their line only', () => {
  const state = editLiteReducer(loadedState, requestTokens)

  expect(state.lines).toEqual({
    ...loadedState.lines,
    1: { ...readyLine(lines[1]), annotation: requestedAnnotation },
  })
  expect(state.lines[0]).toBe(loadedState.lines[0])
})

test.each<[string, number]>([
  ['is not loaded', 5],
  ['failed to load', 3],
])('tokens are not requested for a line that %s', (_name, index) => {
  expect(
    editLiteReducer(loadedState, { type: 'annotationRequested', index }),
  ).toBe(loadedState)
})

test('tokens are not requested again while they load or once they are there', () => {
  const loadingState = editLiteReducer(loadedState, requestTokens)

  expect(editLiteReducer(loadingState, requestTokens)).toBe(loadingState)
  expect(editLiteReducer(tokensState, requestTokens)).toBe(tokensState)
})

test('loaded tokens are kept with the line they were loaded for', () => {
  expect(tokensState.lines[1]).toEqual({
    ...readyLine(lines[1]),
    annotation: buildReadyAnnotation(annotatedLine),
  })
  expect(tokensState.lines[1].annotation?.tokens.value).toBe(annotatedLine)
})

test('tokens that failed to load carry the reason and can be requested again', () => {
  const failedState = reduceEditLite(
    loadedState,
    ...buildTokensFailedActions(1, lines[1], 'no tokens'),
  )

  expect(failedState.lines[1].annotation).toEqual({
    ...requestedAnnotation,
    tokens: failedResource('no tokens'),
  })
  expect(editLiteReducer(failedState, requestTokens).lines[1].annotation).toBe(
    requestedAnnotation,
  )
})

test.each<[string, Line]>([
  ['a line whose tokens are not under way', lines[0]],
  ['an equal copy of the line', { ...lines[1] }],
  ['a line that is not loaded', lines[3]],
])('an answer with tokens for %s is ignored', (_name, original) => {
  const loadingState = editLiteReducer(loadedState, requestTokens)

  expect(editLiteReducer(loadingState, settleTokens(original))).toBe(
    loadingState,
  )
})

test('a second answer with tokens does not replace the first', () => {
  const state = editLiteReducer(tokensState, {
    type: 'annotationSettled',
    original: lines[1],
    tokens: readyResource(otherAnnotatedLine),
  })

  expect(state).toBe(tokensState)
})

test('lemmas are requested once the tokens are there', () => {
  const loadingTokens = editLiteReducer(loadedState, requestTokens)

  expect(editLiteReducer(loadedState, requestLemmas)).toBe(loadedState)
  expect(editLiteReducer(loadingTokens, requestLemmas)).toBe(loadingTokens)
  expect(
    editLiteReducer(tokensState, requestLemmas).lines[1].annotation,
  ).toEqual(buildReadyAnnotation(annotatedLine, { lemmas: loadingResource }))
  expect(editLiteReducer(lemmasState, requestLemmas)).toBe(lemmasState)
})

test('loaded lemmas are kept beside the tokens they were made from', () => {
  expect(lemmasState.lines[1].annotation).toEqual(
    buildReadyAnnotation(annotatedLine, {
      lemmas: readyResource(lemmatization),
    }),
  )
  expect(lemmasState.lines[1].annotation?.lemmas?.value).toBe(lemmatization)
})

test('lemmas that failed to load can be requested again', () => {
  const failedState = reduceEditLite(tokensState, requestLemmas, {
    type: 'lemmasSettled',
    line: annotatedLine,
    lemmas: failedResource('no lemmas'),
  })

  expect(failedState.lines[1].annotation?.lemmas).toEqual(
    failedResource('no lemmas'),
  )
  expect(
    editLiteReducer(failedState, requestLemmas).lines[1].annotation?.lemmas,
  ).toBe(loadingResource)
})

test('an answer with lemmas for other tokens or without a request is ignored', () => {
  const loadingState = editLiteReducer(tokensState, requestLemmas)

  expect(editLiteReducer(loadingState, settleLemmas(otherAnnotatedLine))).toBe(
    loadingState,
  )
  expect(editLiteReducer(tokensState, settleLemmas(annotatedLine))).toBe(
    tokensState,
  )
  expect(editLiteReducer(lemmasState, settleLemmas(annotatedLine))).toBe(
    lemmasState,
  )
  expect(editLiteReducer(loadedState, settleLemmas(annotatedLine))).toBe(
    loadedState,
  )
})

test('a change is kept as the draft of the line', () => {
  const state = reduceEditLite(
    lemmasState,
    changeAnnotation(),
    changeAnnotation(annotatedLine, lemmatizationDraft),
  )

  expect(state.lines[1]).toEqual({
    ...readyLine(lines[1]),
    annotation: buildReadyAnnotation(annotatedLine, {
      lemmas: readyResource(lemmatization),
      draft: lemmatizationDraft,
    }),
  })
  expect(state.lines[1].annotation?.draft).toBe(lemmatizationDraft)
})

test('a change made on other tokens than the ones of the line is ignored', () => {
  expect(
    editLiteReducer(tokensState, changeAnnotation(otherAnnotatedLine)),
  ).toBe(tokensState)
  expect(editLiteReducer(loadedState, changeAnnotation())).toBe(loadedState)
})
