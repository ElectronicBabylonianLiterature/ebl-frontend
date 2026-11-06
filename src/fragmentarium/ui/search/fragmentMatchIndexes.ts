import { Fragment } from 'fragmentarium/domain/fragment'
import takeUniqueMatchingLineIndexes from 'query/takeUniqueMatchingLineIndexes'
import { isTextLine } from 'transliteration/domain/type-guards'

export function textLineIndexes(
  fragment: Fragment,
  matchingLines: readonly number[],
): number[] {
  return takeUniqueMatchingLineIndexes(matchingLines, Number.MAX_SAFE_INTEGER)
    .filter((index) => fragment.text.allLines[index]?.type === 'TextLine')
    .sort((firstIndex, secondIndex) => firstIndex - secondIndex)
}

export function getExpandedMatchIndexes(
  fragment: Fragment,
  availableIndexes: readonly number[],
  linesToShow: number,
  visibleCount: number,
  initialLineIndexes?: readonly number[],
): number[] {
  const available = new Set(availableIndexes)
  const initialIndexes = fragment.text.allLines
    .flatMap((line, responseIndex) =>
      isTextLine(line)
        ? [initialLineIndexes?.[responseIndex] ?? line.index]
        : [],
    )
    .slice(0, linesToShow)
    .filter(
      (index): index is number =>
        typeof index === 'number' && available.has(index),
    )
  return takeUniqueMatchingLineIndexes(
    [...initialIndexes, ...availableIndexes],
    visibleCount,
  ).sort((firstIndex, secondIndex) => firstIndex - secondIndex)
}
