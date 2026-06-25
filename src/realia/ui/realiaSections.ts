import {
  AfoRegisterVolumeGroup,
  RealiaCrossReference,
  RealiaEntry,
} from 'realia/domain/RealiaEntry'

export interface RealiaNavSubsection {
  readonly id: string
  readonly label: string
}

export interface RealiaNavSection {
  readonly id: string
  readonly label: string
  readonly subsections: readonly RealiaNavSubsection[]
}

export const realiaSectionIds = {
  top: 'realia-top',
  reallexikon: 'realia-section-reallexikon',
  afoRegister: 'realia-section-afo-register',
  references: 'realia-section-references',
  seeAlso: 'realia-section-see-also',
} as const

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
}

export function afoVolumeId(realiaId: string, afoVolume: string): string {
  return `realia-afo-volume-${slugify(realiaId)}-${slugify(afoVolume)}`
}

export function rlaArticleId(index: number): string {
  return `realia-rla-article-${index}`
}

export function buildRealiaNav({
  entry,
  volumeGroups,
  crossReferences,
}: {
  entry: RealiaEntry
  volumeGroups: readonly AfoRegisterVolumeGroup[]
  crossReferences: readonly RealiaCrossReference[]
}): readonly RealiaNavSection[] {
  const sections: RealiaNavSection[] = []
  if (entry.reallexikon.length > 0) {
    sections.push({
      id: realiaSectionIds.reallexikon,
      label: 'Reallexikon',
      subsections: entry.reallexikon.map((article, index) => ({
        id: rlaArticleId(index),
        label: article.title,
      })),
    })
  }
  if (entry.afoRegister.length > 0) {
    sections.push({
      id: realiaSectionIds.afoRegister,
      label: 'AfO-Register',
      subsections: volumeGroups.map((group) => ({
        id: afoVolumeId(entry.realiaId, group.volume),
        label: group.volume,
      })),
    })
  }
  if (entry.references.length > 0) {
    sections.push({
      id: realiaSectionIds.references,
      label: 'References',
      subsections: [],
    })
  }
  if (crossReferences.length > 0) {
    sections.push({
      id: realiaSectionIds.seeAlso,
      label: 'See Also',
      subsections: [],
    })
  }
  return sections
}
