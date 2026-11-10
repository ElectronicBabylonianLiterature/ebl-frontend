import { ChapterDisplay } from 'corpus/domain/chapter'
import {
  chapterDisplayFactory,
  lineDisplayFactory,
} from 'test-support/chapter-fixtures'
import { lineVariantDisplayFactory } from 'test-support/dictionary-line-fixtures'
import { lineNumberFactory } from 'test-support/linenumber-factory'

export const baseChapterDisplay = chapterDisplayFactory.build()

export function chapterWithPairs(
  pairs: readonly [number, number][],
): ChapterDisplay {
  const lines = new Map<number, number[]>()
  pairs.forEach(([line, variant]) => {
    lines.set(line, [...(lines.get(line) ?? []), variant])
  })
  return new ChapterDisplay({
    ...baseChapterDisplay,
    lines: [...lines.entries()].map(([line, variants]) =>
      lineDisplayFactory.build({
        originalIndex: line,
        number: lineNumberFactory.build({ number: line + 1 }),
        variants: variants.map((variant, index) =>
          lineVariantDisplayFactory.build({
            originalIndex: variant,
            isPrimaryVariant: index === 0,
            reconstruction: [],
            manuscripts: [],
            parallelLines: [],
            intertext: [],
            note: null,
          }),
        ),
      }),
    ),
  })
}
