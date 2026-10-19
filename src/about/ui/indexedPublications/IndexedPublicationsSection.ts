export interface IndexedPublicationsSection {
  readonly letter: string
  readonly references: readonly string[]
}

export function indexedPublicationsMarkup(
  section: IndexedPublicationsSection,
): string {
  return section.references.join(' ')
}
