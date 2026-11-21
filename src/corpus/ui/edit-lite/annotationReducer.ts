import { Line } from 'corpus/domain/line'
import {
  EditLiteAction,
  EditLiteState,
  LineAnnotation,
  LineState,
} from 'corpus/ui/edit-lite/editLiteState'
import {
  findLemmasTarget,
  findLineIndex,
  findTokensTarget,
  isLoadingLemmasOf,
  isLoadingTokensOf,
  loadingResource,
  requestedAnnotation,
} from 'corpus/ui/edit-lite/lineAnnotations'
import { hasTextChanged, readyLine } from 'corpus/ui/edit-lite/lineStates'
import { withLines } from 'corpus/ui/edit-lite/outlineChanges'

type AnnotationActionType =
  | 'annotationRequested'
  | 'annotationSettled'
  | 'lemmasRequested'
  | 'lemmasSettled'
  | 'annotationChanged'

type AnnotationHandlers = {
  readonly [Type in AnnotationActionType]: (
    state: EditLiteState,
    action: Extract<EditLiteAction, { readonly type: Type }>,
  ) => EditLiteState
}

function withAnnotation(
  state: EditLiteState,
  index: number,
  annotation: LineAnnotation,
): EditLiteState {
  return withLines(state, [[index, { ...state.lines[index], annotation }]])
}

function updateAnnotation(
  state: EditLiteState,
  index: number,
  update: (
    annotation: LineAnnotation,
    lineState: LineState,
  ) => LineAnnotation | null,
): EditLiteState {
  const lineState: LineState | undefined = state.lines[index]
  const annotation = lineState?.annotation
  const updated =
    annotation === undefined ? null : update(annotation, lineState)
  return updated === null ? state : withAnnotation(state, index, updated)
}

function settleAnnotation(
  state: EditLiteState,
  matches: (lineState: LineState) => boolean,
  change: Partial<LineAnnotation>,
): EditLiteState {
  const index = findLineIndex(state, matches)
  return index === null
    ? state
    : updateAnnotation(state, index, (annotation) => ({
        ...annotation,
        ...change,
      }))
}

function canEdit(
  annotation: LineAnnotation,
  lineState: LineState,
  line: Line,
): boolean {
  return (
    annotation.tokens.value === line &&
    !annotation.isStale &&
    !hasTextChanged(lineState)
  )
}

export function resetLoadedLine(
  lineState: LineState,
  original: Line,
): LineState | null {
  const annotation = lineState.annotation
  if (annotation === undefined) {
    return readyLine(original)
  }
  return annotation.isStale
    ? null
    : { ...readyLine(original), annotation: { ...annotation, draft: null } }
}

export const annotationHandlers: AnnotationHandlers = {
  annotationRequested: (state, { index }) =>
    findTokensTarget(state.lines[index]) === null
      ? state
      : withAnnotation(state, index, requestedAnnotation),
  annotationSettled: (state, { original, tokens }) =>
    settleAnnotation(state, isLoadingTokensOf(original), { tokens }),
  lemmasRequested: (state, { index }) =>
    updateAnnotation(state, index, (annotation, lineState) =>
      findLemmasTarget(lineState) === null
        ? null
        : { ...annotation, lemmas: loadingResource },
    ),
  lemmasSettled: (state, { line, lemmas }) =>
    settleAnnotation(state, isLoadingLemmasOf(line), { lemmas }),
  annotationChanged: (state, { index, line, draft }) =>
    updateAnnotation(state, index, (annotation, lineState) =>
      canEdit(annotation, lineState, line) ? { ...annotation, draft } : null,
    ),
}
