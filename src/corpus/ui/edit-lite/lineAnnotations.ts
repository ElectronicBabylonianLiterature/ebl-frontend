import _ from 'lodash'
import { createLineAlignment, Line } from 'corpus/domain/line'
import {
  AnnotationDraft,
  AnnotationView,
  EditLiteState,
  LineAnnotation,
  LineState,
  Loadable,
} from 'corpus/ui/edit-lite/editLiteState'

export const loadingResource: Loadable<never> = {
  status: 'loading',
  value: null,
  error: null,
}

export const requestedAnnotation: LineAnnotation = {
  tokens: loadingResource,
  lemmas: null,
  draft: null,
  isStale: false,
}

export function readyResource<Value>(value: Value): Loadable<Value> {
  return { status: 'ready', value, error: null }
}

export function failedResource(error: string): Loadable<never> {
  return { status: 'failed', value: null, error }
}

export function findAnnotationDraft(
  lineState: LineState | undefined,
): AnnotationDraft | null {
  return lineState?.annotation?.draft ?? null
}

export function findViewDraft<View extends AnnotationView>(
  lineState: LineState | undefined,
  view: View,
): Extract<AnnotationDraft, { readonly view: View }> | null {
  const draft = findAnnotationDraft(lineState)
  return draft?.view === view
    ? (draft as Extract<AnnotationDraft, { readonly view: View }>)
    : null
}

export function hasAnnotationDraft(lineState: LineState | undefined): boolean {
  return findAnnotationDraft(lineState) !== null
}

export function findTokensTarget(
  lineState: LineState | undefined,
): Line | null {
  const annotation = lineState?.annotation
  const isNeeded =
    annotation === undefined || annotation.tokens.status === 'failed'
  return isNeeded ? (lineState?.original ?? null) : null
}

export function findLemmasTarget(
  lineState: LineState | undefined,
): Line | null {
  const annotation = lineState?.annotation
  const isNeeded =
    annotation?.lemmas === null || annotation?.lemmas.status === 'failed'
  return isNeeded ? (annotation?.tokens.value ?? null) : null
}

export function isAnnotationUnrequested(
  lineState: LineState,
  view: AnnotationView,
): boolean {
  const annotation = lineState.annotation
  return (
    annotation === undefined ||
    (view === 'lemmatization' &&
      annotation.tokens.status === 'ready' &&
      annotation.lemmas === null)
  )
}

export function findLineIndex(
  state: EditLiteState,
  matches: (lineState: LineState) => boolean,
): number | null {
  const index = Object.keys(state.lines)
    .map(Number)
    .find((candidate) => matches(state.lines[candidate]))
  return index ?? null
}

export function isLoadingTokensOf(
  original: Line,
): (lineState: LineState) => boolean {
  return (lineState) =>
    lineState.original === original &&
    lineState.annotation?.tokens.status === 'loading'
}

export function isLoadingLemmasOf(
  line: Line,
): (lineState: LineState) => boolean {
  return (lineState) =>
    lineState.annotation?.tokens.value === line &&
    lineState.annotation.lemmas?.status === 'loading'
}

export function createInitialDraft(
  annotation: LineAnnotation,
  view: AnnotationView,
): AnnotationDraft | null {
  const line = annotation.tokens.value
  const lemmatization = annotation.lemmas?.value ?? null
  if (view === 'alignment') {
    return line === null ? null : { view, alignment: createLineAlignment(line) }
  }
  return lemmatization === null ? null : { view, lemmatization }
}

export function withStaleAnnotation(lineState: LineState): LineState {
  const annotation = lineState.annotation
  if (annotation === undefined) {
    return lineState
  }
  return annotation.draft === null
    ? _.omit(lineState, 'annotation')
    : { ...lineState, annotation: { ...annotation, isStale: true } }
}
