import _ from 'lodash'
import { LineOutline } from 'corpus/application/edit-lite/chapterOutline'

export interface MoveChoice {
  readonly to: number
  readonly label: string
}

export const beginningChoiceLabel = 'At the beginning'

const beginningIndex = -1

export function moveIndex(index: number, from: number, to: number): number {
  if (index === from) {
    return to
  }
  const isPulledBack = from < index && index <= to
  const isPushedOn = to <= index && index < from
  return index + Number(isPushedOn) - Number(isPulledBack)
}

export function deleteIndex(index: number, deletedIndex: number): number {
  return index - Number(index > deletedIndex)
}

export function moveItem<Item>(
  items: readonly Item[],
  from: number,
  to: number,
): Item[] {
  const moved = [...items]
  moved.splice(to, 0, ...moved.splice(from, 1))
  return moved
}

export function findMoveTarget(from: number, precedingIndex: number): number {
  return precedingIndex < from ? precedingIndex + 1 : precedingIndex
}

export function listMoveChoices(
  lines: readonly LineOutline[],
  from: number,
): MoveChoice[] {
  return _.range(beginningIndex, lines.length)
    .filter(
      (precedingIndex) =>
        precedingIndex !== from && precedingIndex !== from - 1,
    )
    .map((precedingIndex) => ({
      to: findMoveTarget(from, precedingIndex),
      label:
        precedingIndex === beginningIndex
          ? beginningChoiceLabel
          : `After line ${lines[precedingIndex].number}`,
    }))
}

export function moveLineOutlines(
  lines: readonly LineOutline[],
  from: number,
  to: number,
): LineOutline[] {
  return moveItem(lines, from, to).map((line, index) =>
    line.index === index ? line : { ...line, index },
  )
}
