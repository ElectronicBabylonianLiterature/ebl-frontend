import { ChapterDisplay, LineDisplay } from 'corpus/domain/chapter'

export type CorpusMatchPair = {
  readonly line: number
  readonly variant: number
}
export const CORPUS_MATCH_BATCH_SIZE = 10

export function corpusMatchPairKey({ line, variant }: CorpusMatchPair): string {
  return `${line}:${variant}`
}

export function uniqueCorpusMatchPairs(
  lines: readonly number[],
  variants: readonly number[],
): CorpusMatchPair[] {
  const pairs: CorpusMatchPair[] = []
  const seen = new Set<string>()
  for (
    let index = 0;
    index < Math.min(lines.length, variants.length);
    index++
  ) {
    const line = lines[index]
    const variant = variants[index]
    if (
      !Number.isSafeInteger(line) ||
      line < 0 ||
      !Number.isSafeInteger(variant) ||
      variant < 0
    ) {
      continue
    }
    const pair = { line, variant }
    const key = corpusMatchPairKey(pair)
    if (!seen.has(key)) {
      seen.add(key)
      pairs.push(pair)
    }
  }
  return pairs
}

export function mergeChapterDisplays(
  current: ChapterDisplay,
  additional: ChapterDisplay,
): ChapterDisplay {
  const lines = new Map<number, LineDisplay>(
    current.lines.map((line) => [line.originalIndex, line]),
  )
  for (const line of additional.lines) {
    const previous = lines.get(line.originalIndex)
    if (!previous) {
      lines.set(line.originalIndex, line)
      continue
    }
    const variants = new Map(
      previous.variants.map((variant) => [variant.originalIndex, variant]),
    )
    line.variants.forEach((variant) =>
      variants.set(variant.originalIndex, variant),
    )
    lines.set(line.originalIndex, {
      ...previous,
      variants: [...variants.values()]
        .sort((first, second) => first.originalIndex - second.originalIndex)
        .map((variant, index) => ({
          ...variant,
          isPrimaryVariant: index === 0,
        })),
    })
  }
  return new ChapterDisplay({
    ...current,
    lines: [...lines.values()].sort(
      (first, second) => first.originalIndex - second.originalIndex,
    ),
  })
}
