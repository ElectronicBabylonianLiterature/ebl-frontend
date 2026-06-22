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
  readonly mainWords: readonly string[]
  readonly pageRange: string
  readonly hasDistinctMainWords: boolean
  readonly hasDistinctPages: boolean
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

function formatPageRange(pages: readonly string[]): string {
  const distinctPages = _.uniq(pages.filter((page) => page !== ''))
  if (distinctPages.length <= 1) {
    return distinctPages[0] ?? ''
  }
  const allNumeric = distinctPages.every((page) => /^\d+$/.test(page))
  const ordered = allNumeric
    ? [...distinctPages].sort((first, second) => Number(first) - Number(second))
    : distinctPages
  return `${ordered[0]}-${ordered[ordered.length - 1]}`
}

function buildVolumeGroup(
  volume: string,
  entries: readonly AfoRegisterVolumeEntry[],
): AfoRegisterVolumeGroup {
  const mainWords = _.uniq(entries.map((entry) => entry.mainWord))
  const distinctPages = _.uniq(
    entries.map((entry) => entry.page).filter((page) => page !== ''),
  )
  return {
    volume,
    mainWords,
    pageRange: formatPageRange(entries.map((entry) => entry.page)),
    hasDistinctMainWords: mainWords.length > 1,
    hasDistinctPages: distinctPages.length > 1,
    entries,
  }
}

export function groupAfoRegisterByVolume(
  entries: readonly AfoRegisterEntry[],
): readonly AfoRegisterVolumeGroup[] {
  const entriesByVolume = new Map<string, AfoRegisterVolumeEntry[]>()
  entries.forEach((entry) => {
    const { volume, page } = parseAfoCitation(entry.AfO)
    if (!entriesByVolume.has(volume)) {
      entriesByVolume.set(volume, [])
    }
    entriesByVolume.get(volume)?.push({ ...entry, page })
  })
  return [...entriesByVolume].map(([volume, volumeEntries]) =>
    buildVolumeGroup(volume, volumeEntries),
  )
}

export interface AfoRegisterVolumeTitle {
  readonly mainWord: string
  readonly details: string
}

export function formatAfoRegisterVolumeTitle(
  entryId: string,
  group: AfoRegisterVolumeGroup,
): AfoRegisterVolumeTitle {
  const mainWords = group.mainWords.filter((mainWord) => mainWord !== '')
  const mainWord = mainWords.length > 0 ? mainWords.join(', ') : entryId
  const details = [group.volume, group.pageRange]
    .filter((part) => part !== '')
    .join(', ')
  return { mainWord, details }
}
