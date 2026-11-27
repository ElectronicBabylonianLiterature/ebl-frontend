export const maximumLinesPerRequest = 10

export interface LineRange {
  readonly offset: number
  readonly limit: number
}

export function splitIntoRanges(offset: number, limit: number): LineRange[] {
  const ranges: LineRange[] = []
  for (
    let rangeOffset = offset;
    rangeOffset < offset + limit;
    rangeOffset += maximumLinesPerRequest
  ) {
    ranges.push({
      offset: rangeOffset,
      limit: Math.min(maximumLinesPerRequest, offset + limit - rangeOffset),
    })
  }
  return ranges
}
