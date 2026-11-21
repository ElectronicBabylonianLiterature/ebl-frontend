import { createLineAlignment, Line } from 'corpus/domain/line'
import {
  buildAlignmentDraft,
  buildReadyAnnotation,
} from 'corpus/ui/edit-lite/annotationState.testSupport'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  buildLinesLoadedActions,
  reduceEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { createEditLiteState } from 'corpus/ui/edit-lite/editLiteReducer'
import { LineAnnotation, LineState } from 'corpus/ui/edit-lite/editLiteState'
import {
  annotateLine,
  buildLineLemmatization,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import {
  createInitialDraft,
  failedResource,
  findAnnotationDraft,
  findLemmasTarget,
  findLineIndex,
  findTokensTarget,
  findViewDraft,
  hasAnnotationDraft,
  isAnnotationUnrequested,
  isLoadingLemmasOf,
  isLoadingTokensOf,
  loadingResource,
  readyResource,
  requestedAnnotation,
  withStaleAnnotation,
} from 'corpus/ui/edit-lite/lineAnnotations'
import {
  failedLine,
  loadingLine,
  readyLine,
} from 'corpus/ui/edit-lite/lineStates'

const [line]: readonly Line[] = buildEditLiteLines(1)
const annotatedLine: Line = annotateLine(line)
const lemmatization = buildLineLemmatization(annotatedLine)
const alignmentDraft = buildAlignmentDraft(annotatedLine)
const failedTokens: LineAnnotation = {
  ...requestedAnnotation,
  tokens: failedResource('no tokens'),
}

function withAnnotation(annotation: Partial<LineAnnotation>): LineState {
  return {
    ...readyLine(line),
    annotation: buildReadyAnnotation(annotatedLine, annotation),
  }
}

test('builds the three states of something that is loaded', () => {
  expect(loadingResource).toEqual({
    status: 'loading',
    value: null,
    error: null,
  })
  expect(readyResource(annotatedLine)).toEqual({
    status: 'ready',
    value: annotatedLine,
    error: null,
  })
  expect(failedResource('refused')).toEqual({
    status: 'failed',
    value: null,
    error: 'refused',
  })
  expect(requestedAnnotation).toEqual({
    tokens: loadingResource,
    lemmas: null,
    draft: null,
    isStale: false,
  })
})

test('finds the draft of a line and of one view', () => {
  const lineState = withAnnotation({ draft: alignmentDraft })

  expect(findAnnotationDraft(lineState)).toBe(alignmentDraft)
  expect(findViewDraft(lineState, 'alignment')).toBe(alignmentDraft)
  expect(findViewDraft(lineState, 'lemmatization')).toBeNull()
  expect(hasAnnotationDraft(lineState)).toBe(true)
  expect(
    [undefined, readyLine(line), withAnnotation({})].map((state) => [
      findAnnotationDraft(state),
      findViewDraft(state, 'alignment'),
      hasAnnotationDraft(state),
    ]),
  ).toEqual(Array(3).fill([null, null, false]))
})

test.each<[string, LineState | undefined, Line | null]>([
  ['an unknown line', undefined, null],
  ['a line that is loading', loadingLine, null],
  ['a line that failed to load', failedLine('refused'), null],
  ['a loaded line', readyLine(line), line],
  [
    'a line whose tokens are loading',
    { ...readyLine(line), annotation: requestedAnnotation },
    null,
  ],
  [
    'a line whose tokens failed',
    { ...readyLine(line), annotation: failedTokens },
    line,
  ],
  ['a line with tokens', withAnnotation({}), null],
])(
  'the tokens of %s are loaded for the right line',
  (_name, lineState, target) => {
    expect(findTokensTarget(lineState)).toBe(target)
  },
)

test.each<[string, LineState | undefined, Line | null]>([
  ['an unknown line', undefined, null],
  ['a line without tokens', readyLine(line), null],
  [
    'a line whose tokens are loading',
    { ...readyLine(line), annotation: requestedAnnotation },
    null,
  ],
  [
    'a line whose tokens failed',
    { ...readyLine(line), annotation: failedTokens },
    null,
  ],
  ['a line with tokens', withAnnotation({}), annotatedLine],
  [
    'a line whose lemmas are loading',
    withAnnotation({ lemmas: loadingResource }),
    null,
  ],
  [
    'a line whose lemmas failed',
    withAnnotation({ lemmas: failedResource('refused') }),
    annotatedLine,
  ],
  [
    'a line with lemmas',
    withAnnotation({ lemmas: readyResource(lemmatization) }),
    null,
  ],
])(
  'the lemmas of %s are loaded for the right line',
  (_name, lineState, target) => {
    expect(findLemmasTarget(lineState)).toBe(target)
  },
)

test.each<[string, boolean, boolean, LineState]>([
  ['nothing', true, true, readyLine(line)],
  [
    'loading tokens',
    false,
    false,
    { ...readyLine(line), annotation: requestedAnnotation },
  ],
  [
    'failed tokens',
    false,
    false,
    { ...readyLine(line), annotation: failedTokens },
  ],
  ['tokens', false, true, withAnnotation({})],
  ['loading lemmas', false, false, withAnnotation({ lemmas: loadingResource })],
  [
    'failed lemmas',
    false,
    false,
    withAnnotation({ lemmas: failedResource('refused') }),
  ],
])(
  'a line with %s is still to be requested for the alignment: %s, for the lemmatization: %s',
  (_name, forAlignment, forLemmatization, lineState) => {
    expect(isAnnotationUnrequested(lineState, 'alignment')).toBe(forAlignment)
    expect(isAnnotationUnrequested(lineState, 'lemmatization')).toBe(
      forLemmatization,
    )
  },
)

test('the initial value of a view comes from the loaded tokens and lemmas', () => {
  const annotation = buildReadyAnnotation(annotatedLine, {
    lemmas: readyResource(lemmatization),
  })

  expect(createInitialDraft(annotation, 'alignment')).toEqual({
    view: 'alignment',
    alignment: createLineAlignment(annotatedLine),
  })
  expect(createInitialDraft(annotation, 'lemmatization')).toEqual({
    view: 'lemmatization',
    lemmatization,
  })
  expect(createInitialDraft(requestedAnnotation, 'alignment')).toBeNull()
  expect(
    createInitialDraft(buildReadyAnnotation(annotatedLine), 'lemmatization'),
  ).toBeNull()
  expect(
    createInitialDraft(
      buildReadyAnnotation(annotatedLine, { lemmas: loadingResource }),
      'lemmatization',
    ),
  ).toBeNull()
})

test('the line that waits for tokens or lemmas is found by what was requested for it', () => {
  const state = reduceEditLite(
    createEditLiteState(buildEditLiteOutline([line, line])),
    ...buildLinesLoadedActions(0, [line, { ...line }]),
    { type: 'annotationRequested', index: 1 },
  )
  const loadingLemmas = withAnnotation({ lemmas: loadingResource })
  const copy = state.lines[1].original as Line

  expect(findLineIndex(state, isLoadingTokensOf(copy))).toBe(1)
  expect(findLineIndex(state, isLoadingTokensOf(line))).toBeNull()
  expect(findLineIndex(state, isLoadingTokensOf({ ...line }))).toBeNull()
  expect(isLoadingLemmasOf(annotatedLine)(loadingLemmas)).toBe(true)
  expect(isLoadingLemmasOf(annotateLine(line))(loadingLemmas)).toBe(false)
  expect(isLoadingLemmasOf(annotatedLine)(withAnnotation({}))).toBe(false)
  expect(isLoadingLemmasOf(annotatedLine)(readyLine(line))).toBe(false)
  expect(
    isLoadingLemmasOf(annotatedLine)(
      withAnnotation({ lemmas: readyResource(lemmatization) }),
    ),
  ).toBe(false)
})

test('a line that changed on the server keeps its draft as stale and drops clean tokens', () => {
  const clean = readyLine(line)

  expect(withStaleAnnotation(clean)).toBe(clean)
  expect(withStaleAnnotation(withAnnotation({}))).toEqual(clean)
  expect(
    withStaleAnnotation({ ...clean, annotation: requestedAnnotation }),
  ).toEqual(clean)
  expect(
    withStaleAnnotation(withAnnotation({ draft: alignmentDraft })),
  ).toEqual(withAnnotation({ draft: alignmentDraft, isStale: true }))
})
