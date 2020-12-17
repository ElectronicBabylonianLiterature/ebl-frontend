import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

export function expectedLabel(entry: BibliographyEntry): string {
  return `${entry.primaryAuthor} ${entry.year} ${entry.title}`
}
