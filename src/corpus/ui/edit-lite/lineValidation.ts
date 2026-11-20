import { ManuscriptSummary } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'

export const missingVariantMessage =
  'A line needs at least one variant before it can be saved.'
export const missingSiglumMessage =
  'Choose a siglum for every manuscript line before saving.'

function hasUnknownManuscript(
  line: Line,
  manuscripts: readonly ManuscriptSummary[],
): boolean {
  const knownIds = new Set(manuscripts.map((manuscript) => manuscript.id))
  return line.variants.some((variant) =>
    variant.manuscripts.some(
      (manuscriptLine) => !knownIds.has(manuscriptLine.manuscriptId),
    ),
  )
}

export function findLineProblem(
  line: Line,
  manuscripts: readonly ManuscriptSummary[],
): string | null {
  if (line.variants.length === 0) {
    return missingVariantMessage
  }
  return hasUnknownManuscript(line, manuscripts) ? missingSiglumMessage : null
}
