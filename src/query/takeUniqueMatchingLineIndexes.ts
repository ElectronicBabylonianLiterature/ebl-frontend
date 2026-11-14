import isNonNegativeInteger from 'common/utils/isNonNegativeInteger'

export default function takeUniqueMatchingLineIndexes(
  indexes: readonly number[],
  limit: number,
): number[] {
  const result: number[] = []
  const seen = new Set<number>()

  if (limit <= 0) {
    return result
  }

  for (const index of indexes) {
    if (isNonNegativeInteger(index) && !seen.has(index)) {
      seen.add(index)
      result.push(index)
      if (result.length >= limit) {
        break
      }
    }
  }

  return result
}
