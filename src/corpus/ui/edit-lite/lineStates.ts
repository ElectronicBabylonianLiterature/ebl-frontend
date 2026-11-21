import { areLinesEqual } from 'corpus/application/edit-lite/lineEdits'
import { Line } from 'corpus/domain/line'
import {
  EditLiteState,
  LineState,
  LineStatus,
  LineView,
} from 'corpus/ui/edit-lite/editLiteState'
import { findAnnotationDraft } from 'corpus/ui/edit-lite/lineAnnotations'

export type LineActivity = 'idle' | 'saving' | 'deleting' | 'moving'

const busyActivities: readonly Exclude<LineActivity, 'idle'>[] = [
  'moving',
  'deleting',
  'saving',
]

const progressLabels: Readonly<Partial<Record<LineStatus, string>>> = {
  saving: 'Saving...',
  deleting: 'Deleting...',
  moving: 'Moving...',
}

export const loadingLine: LineState = {
  status: 'loading',
  original: null,
  draft: null,
  error: null,
}

export function readyLine(line: Line): LineState {
  return { status: 'ready', original: line, draft: line, error: null }
}

export function failedLine(error: string): LineState {
  return { status: 'failed', original: null, draft: null, error }
}

export function hasTextChanged(lineState: LineState | undefined): boolean {
  const original = lineState?.original ?? null
  const draft = lineState?.draft ?? null
  return (
    original !== null &&
    draft !== null &&
    draft !== original &&
    !areLinesEqual(original, draft)
  )
}

export function hasLineChanged(lineState: LineState | undefined): boolean {
  return hasTextChanged(lineState) || findAnnotationDraft(lineState) !== null
}

export function findUnsavedView(lineState: LineState): LineView | null {
  const annotationDraft = findAnnotationDraft(lineState)
  if (annotationDraft !== null) {
    return annotationDraft.view
  }
  return hasTextChanged(lineState) ? 'text' : null
}

export function isLineLoaded(lineState: LineState | undefined): boolean {
  return (lineState?.draft ?? null) !== null
}

export function hasLineFailed(lineState: LineState | undefined): boolean {
  return lineState?.status === 'failed' && isLineLoaded(lineState)
}

export function findNewLineIndex(state: EditLiteState): number {
  return state.outline.lines.length
}

export function countLines(state: EditLiteState): number {
  return state.outline.lines.length + (state.newLine === null ? 0 : 1)
}

export function findLineState(
  state: EditLiteState,
  index: number,
): LineState | undefined {
  return index === findNewLineIndex(state)
    ? (state.newLine ?? undefined)
    : state.lines[index]
}

function listLineStates(state: EditLiteState): readonly LineState[] {
  return [
    ...Object.values(state.lines),
    ...(state.newLine === null ? [] : [state.newLine]),
  ]
}

export function findLineActivity(state: EditLiteState): LineActivity {
  const statuses = new Set<LineStatus>(
    listLineStates(state).map((lineState) => lineState.status),
  )
  return busyActivities.find((activity) => statuses.has(activity)) ?? 'idle'
}

export function isLayoutChanging(activity: LineActivity): boolean {
  return activity === 'deleting' || activity === 'moving'
}

export function findProgressLabel(status: LineStatus): string | null {
  return progressLabels[status] ?? null
}

export function hasUnsavedChanges(state: EditLiteState): boolean {
  return (
    state.newLine !== null ||
    state.hasUnsavedManuscripts ||
    Object.values(state.lines).some(hasLineChanged)
  )
}
