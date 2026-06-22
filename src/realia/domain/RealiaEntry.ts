import _ from 'lodash'
import Reference from 'bibliography/domain/Reference'

export interface RealiaCrossReference {
  readonly id: string
  readonly lemma: string
}

export interface AfoRegisterEntry {
  readonly mainWord: string
  readonly note: string
  readonly AfO: string
  readonly reference: string
  readonly crossReference: string
}

export interface ReallexikonEntry {
  readonly id: string
  readonly title: string
  readonly content: string
  readonly references: readonly Reference[]
}

export interface RealiaEntry {
  readonly id: string
  readonly relatedTerms: readonly string[]
  readonly type: readonly string[]
  readonly wikidataId: readonly string[]
  readonly afoRegister: readonly AfoRegisterEntry[]
  readonly reallexikon: readonly ReallexikonEntry[]
  readonly crossReferences: readonly RealiaCrossReference[]
  readonly afoCrossReferences: readonly RealiaCrossReference[]
  readonly references: readonly Reference[]
}

export function getRealiaCrossReferences(
  entry: RealiaEntry,
): readonly RealiaCrossReference[] {
  return _.uniqBy(
    [...entry.crossReferences, ...entry.afoCrossReferences],
    (crossReference) => crossReference.id,
  )
}

export interface AfoRegisterVolumeEntry extends AfoRegisterEntry {
  readonly page: string
}

export interface AfoRegisterVolumeGroup {
  readonly volume: string
  readonly entries: readonly AfoRegisterVolumeEntry[]
}

export function formatAfoVolume(afo: string): string {
  const trimmed = afo.trim()
  return /^AfO\b/i.test(trimmed) ? trimmed : `AfO ${trimmed}`
}

function parseAfoCitation(afo: string): { volume: string; page: string } {
  const normalized = formatAfoVolume(afo)
  const parenthesizedVolume = normalized.match(/^(.*\))\s*,?\s*(.*)$/)
  if (parenthesizedVolume) {
    return {
      volume: parenthesizedVolume[1].trim(),
      page: parenthesizedVolume[2].trim(),
    }
  }
  const lastComma = normalized.lastIndexOf(',')
  if (lastComma !== -1) {
    return {
      volume: normalized.slice(0, lastComma).trim(),
      page: normalized.slice(lastComma + 1).trim(),
    }
  }
  return { volume: normalized, page: '' }
}

export function groupAfoRegisterByVolume(
  entries: readonly AfoRegisterEntry[],
): readonly AfoRegisterVolumeGroup[] {
  const groups: AfoRegisterVolumeGroup[] = []
  const groupIndexByVolume = new Map<string, number>()
  entries.forEach((entry) => {
    const { volume, page } = parseAfoCitation(entry.AfO)
    if (!groupIndexByVolume.has(volume)) {
      groupIndexByVolume.set(volume, groups.length)
      groups.push({ volume, entries: [] })
    }
    const group = groups[groupIndexByVolume.get(volume) as number]
    ;(group.entries as AfoRegisterVolumeEntry[]).push({ ...entry, page })
  })
  return groups
}
