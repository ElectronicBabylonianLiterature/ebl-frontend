export interface EntryNavSubsection {
  readonly id: string
  readonly label: string
}

export interface EntryNavSection {
  readonly id: string
  readonly label: string
  readonly subsections: readonly EntryNavSubsection[]
}

export function getEntryAnchorIds(
  topId: string,
  sections: readonly EntryNavSection[],
): readonly string[] {
  return [
    topId,
    ...sections.flatMap((section) =>
      section.subsections.length > 0
        ? section.subsections.map((subsection) => subsection.id)
        : [section.id],
    ),
  ]
}

export function getEntrySectionByAnchor(
  sections: readonly EntryNavSection[],
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    sections.flatMap((section) => [
      [section.id, section.id],
      ...section.subsections.map((subsection) => [subsection.id, section.id]),
    ]),
  )
}
