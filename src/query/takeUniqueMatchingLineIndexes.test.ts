import takeUniqueMatchingLineIndexes from 'query/takeUniqueMatchingLineIndexes'

describe('takeUniqueMatchingLineIndexes', () => {
  it('preserves the first distinct source indexes across overlapping windows', () => {
    expect(
      takeUniqueMatchingLineIndexes([0, 1, 2, 2, 3, 4, 4, 5, 6], 5),
    ).toEqual([0, 1, 2, 3, 4])
  })

  it('ignores malformed indexes', () => {
    expect(
      takeUniqueMatchingLineIndexes([-1, Number.NaN, 0, 0, 1.5, 2], 5),
    ).toEqual([0, 2])
  })

  it('stops reading once the requested preview is complete', () => {
    const indexes = [0, 1, 2, 0]
    Object.defineProperty(indexes, 3, {
      get: () => {
        throw new Error('Should not scan the remaining matches')
      },
    })

    expect(takeUniqueMatchingLineIndexes(indexes, 3)).toEqual([0, 1, 2])
  })
})
