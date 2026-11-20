import { areLinesEqual } from 'corpus/application/edit-lite/lineEdits'
import { Line } from 'corpus/domain/line'
import { EditLiteState, LineState } from 'corpus/ui/edit-lite/editLiteState'

export type LineActivity = 'idle' | 'saving' | 'deleting'

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

export function hasLineChanged(lineState: LineState | undefined): boolean {
  const original = lineState?.original ?? null
  const draft = lineState?.draft ?? null
  return (
    original !== null &&
    draft !== null &&
    draft !== original &&
    !areLinesEqual(original, draft)
  )
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
  const statuses = new Set(
    listLineStates(state).map((lineState) => lineState.status),
  )
  if (statuses.has('deleting')) {
    return 'deleting'
  }
  return statuses.has('saving') ? 'saving' : 'idle'
}

export function hasUnsavedChanges(state: EditLiteState): boolean {
  return (
    state.newLine !== null ||
    state.hasUnsavedManuscripts ||
    Object.values(state.lines).some(hasLineChanged)
  )
}
