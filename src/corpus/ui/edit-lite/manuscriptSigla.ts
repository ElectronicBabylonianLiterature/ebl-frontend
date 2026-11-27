import { ManuscriptSummary } from 'corpus/application/edit-lite/chapterOutline'

export const unknownSiglum = '<unknown>'

export function findSiglum(
  manuscripts: readonly ManuscriptSummary[],
  manuscriptId: number,
): string | null {
  return (
    manuscripts.find((manuscript) => manuscript.id === manuscriptId)?.siglum ??
    null
  )
}

export function findSiglumLabel(
  manuscripts: readonly ManuscriptSummary[],
  manuscriptId: number,
): string {
  return findSiglum(manuscripts, manuscriptId) ?? unknownSiglum
}
