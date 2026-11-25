import { EntryNavSection } from 'common/ui/entry-page/entryNavSections'
import {
  afoVolumeLabel,
  AfoRegisterVolumeGroup,
  RealiaCrossReference,
  RealiaEntry,
} from 'realia/domain/RealiaEntry'

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

export function afoVolumeId(afoVolume: string): string {
  return slugify(afoVolume)
}

export function rlaArticleId(title: string): string {
  return `rla-${slugify(title)}`
}

export function buildRealiaNav({
  entry,
  volumeGroups,
  crossReferences,
}: {
  entry: RealiaEntry
  volumeGroups: readonly AfoRegisterVolumeGroup[]
  crossReferences: readonly RealiaCrossReference[]
}): readonly EntryNavSection[] {
  const sections: EntryNavSection[] = []
  if (entry.reallexikon.length > 0) {
    sections.push({
      id: realiaSectionIds.reallexikon,
      label: 'Reallexikon',
      subsections: entry.reallexikon.map((article) => ({
        id: rlaArticleId(article.title),
        label: article.title,
      })),
    })
  }
  if (entry.afoRegister.length > 0) {
    sections.push({
      id: realiaSectionIds.afoRegister,
      label: 'AfO-Register',
      subsections: volumeGroups.map((group) => ({
        id: afoVolumeId(group.volume),
        label: afoVolumeLabel(group),
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
