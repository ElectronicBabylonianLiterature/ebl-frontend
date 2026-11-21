import _ from 'lodash'
import { lineChangedOnServerMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import {
  EditLiteState,
  LineState,
  LineStatus,
} from 'corpus/ui/edit-lite/editLiteState'
import {
  deleteIndex,
  moveIndex,
  moveLineOutlines,
} from 'corpus/ui/edit-lite/lineMove'
import { hasLineChanged, isLineLoaded } from 'corpus/ui/edit-lite/lineStates'

export type LineStateEntry = readonly [number, LineState]

const pendingStatuses: readonly LineStatus[] = [
  'loading',
  'saving',
  'deleting',
  'moving',
]

function reuseEqualItems<Item>(
  previous: readonly Item[],
  next: readonly Item[],
): readonly Item[] {
  return _.isEqual(previous, next)
    ? previous
    : next.map((item, index) =>
        _.isEqual(item, previous[index]) ? previous[index] : item,
      )
}

function mergeOutline(
  previous: ChapterOutline,
  next: ChapterOutline,
): ChapterOutline {
  return {
    ...next,
    uncertainFragments: reuseEqualItems(
      previous.uncertainFragments,
      next.uncertainFragments,
    ),
    manuscripts: reuseEqualItems(previous.manuscripts, next.manuscripts),
    lines: reuseEqualItems(previous.lines, next.lines),
  }
}

function reconcileLine(
  lineState: LineState,
  isOutlineUnchanged: boolean,
): LineState | null {
  if (isOutlineUnchanged || pendingStatuses.includes(lineState.status)) {
    return lineState
  }
  return hasLineChanged(lineState)
    ? { ...lineState, status: 'failed', error: lineChangedOnServerMessage }
    : null
}

function reconcileLines(
  state: EditLiteState,
  outline: ChapterOutline,
): readonly LineStateEntry[] {
  return Object.keys(state.lines)
    .map(Number)
    .flatMap((index): LineStateEntry[] => {
      const isOutlineUnchanged =
        index < outline.lines.length &&
        outline.lines[index] === state.outline.lines[index]
      const lineState = reconcileLine(state.lines[index], isOutlineUnchanged)
      return lineState === null ? [] : [[index, lineState]]
    })
}

function listLoadedIndices(
  lines: Readonly<Record<number, LineState>>,
): number[] {
  return Object.keys(lines)
    .map(Number)
    .filter((index) => isLineLoaded(lines[index]))
}

function shiftLines(
  lines: Readonly<Record<number, LineState>>,
  deletedIndex: number,
): readonly LineStateEntry[] {
  return listLoadedIndices(lines)
    .filter((index) => index !== deletedIndex)
    .map((index) => [deleteIndex(index, deletedIndex), lines[index]])
}

function moveLines(
  lines: Readonly<Record<number, LineState>>,
  from: number,
  to: number,
): readonly LineStateEntry[] {
  return listLoadedIndices(lines).map((index) => [
    moveIndex(index, from, to),
    index === from
      ? { ...lines[index], status: 'ready', error: null }
      : lines[index],
  ])
}

export function withLines(
  state: EditLiteState,
  entries: readonly LineStateEntry[],
): EditLiteState {
  return {
    ...state,
    lines: { ...state.lines, ...Object.fromEntries(entries) },
  }
}

export function replaceOutline(
  state: EditLiteState,
  nextOutline: ChapterOutline,
): EditLiteState {
  const outline = mergeOutline(state.outline, nextOutline)
  return {
    ...state,
    outline,
    lines: Object.fromEntries(reconcileLines(state, outline)),
  }
}

export function removeLine(
  state: EditLiteState,
  index: number,
  nextOutline: ChapterOutline,
): EditLiteState {
  return {
    ...state,
    outline: mergeOutline(state.outline, nextOutline),
    lines: Object.fromEntries(shiftLines(state.lines, index)),
    layoutVersion: state.layoutVersion + 1,
  }
}

export function hasSameLineCount(
  state: EditLiteState,
  nextOutline: ChapterOutline,
): boolean {
  return nextOutline.lines.length === state.outline.lines.length
}

function rekeyMovedLines(
  state: EditLiteState,
  from: number,
  to: number,
): EditLiteState {
  return {
    ...state,
    outline: {
      ...state.outline,
      lines: moveLineOutlines(state.outline.lines, from, to),
    },
    lines: Object.fromEntries(moveLines(state.lines, from, to)),
  }
}

export function moveLine(
  state: EditLiteState,
  from: number,
  to: number,
  nextOutline: ChapterOutline,
): EditLiteState {
  const movedState: EditLiteState = hasSameLineCount(state, nextOutline)
    ? rekeyMovedLines(state, from, to)
    : { ...state, lines: {} }
  return {
    ...replaceOutline(movedState, nextOutline),
    layoutVersion: state.layoutVersion + 1,
  }
}
