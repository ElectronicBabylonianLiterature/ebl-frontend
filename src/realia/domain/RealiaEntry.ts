import _ from 'lodash'
import Reference from 'bibliography/domain/Reference'

export interface RealiaCrossReference {
  readonly id: string
  readonly lemma: string
}

export interface AfoRegisterEntry {
  readonly mainWord: string
  readonly note: string
  readonly afoVolume: string
  readonly year: string
  readonly page: string
  readonly AfO: string
  readonly reference: string
  readonly crossReference: string
  readonly crossReferences: readonly RealiaCrossReference[]
}

export function realiaCrossReferenceTarget(
  crossReference: RealiaCrossReference,
): string {
  // The route resolves entries by their `_id`, which equals the lemma; the
  // realiaId is not a resolvable navigation key.
  return crossReference.lemma || crossReference.id
}

export function afoCrossReferenceCitation(afoEntry: AfoRegisterEntry): string {
  const parts = [afoEntry.afoVolume, afoEntry.page].filter(
    (part) => part !== '',
  )
  return parts.length > 0 ? `(${parts.join(', ')})` : ''
}

export interface ReallexikonEntry {
  readonly id: string
  readonly title: string
  readonly reference: Reference | null
}

export const RLA_ONLINE_BASE = 'https://publikationen.badw.de/de/rla/index'

export function rlaArticleUrl(id: string): string {
  return `${RLA_ONLINE_BASE}#${encodeURIComponent(id)}`
}

export interface RealiaEntry {
  readonly id: string
  readonly realiaId: string
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

function isStubReallexikon(entries: readonly ReallexikonEntry[]): boolean {
  return entries.every((entry) => entry.reference === null)
}

function hasOwnContent(entry: RealiaEntry): boolean {
  return [
    entry.afoRegister.length > 0,
    entry.references.length > 0,
    entry.afoCrossReferences.length > 0,
    entry.reallexikon.length > 1,
    !isStubReallexikon(entry.reallexikon),
  ].some(Boolean)
}

export function getRedirectTarget(
  entry: RealiaEntry,
): RealiaCrossReference | null {
  return !hasOwnContent(entry) && entry.crossReferences.length === 1
    ? entry.crossReferences[0]
    : null
}

export interface AfoRegisterVolumeGroup {
  readonly volume: string
  readonly year: string
  readonly mainWords: readonly string[]
  readonly pageRange: string
  readonly hasDistinctMainWords: boolean
  readonly hasDistinctPages: boolean
  readonly entries: readonly AfoRegisterEntry[]
}

export function afoVolumeLabel(group: AfoRegisterVolumeGroup): string {
  return group.year ? `${group.volume} (${group.year})` : group.volume
}

function afoVolumeSortKey(volume: string): number {
  const match = volume.match(/\d+/)
  return match ? Number(match[0]) : 0
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
  entries: readonly AfoRegisterEntry[],
): AfoRegisterVolumeGroup {
  const mainWords = _.uniq(entries.map((entry) => entry.mainWord))
  const distinctPages = _.uniq(
    entries.map((entry) => entry.page).filter((page) => page !== ''),
  )
  const year = entries.map((entry) => entry.year).find((value) => value !== '')
  return {
    volume,
    year: year ?? '',
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
  const entriesByVolume = new Map<string, AfoRegisterEntry[]>()
  entries.forEach((entry) => {
    if (!entriesByVolume.has(entry.afoVolume)) {
      entriesByVolume.set(entry.afoVolume, [])
    }
    entriesByVolume.get(entry.afoVolume)?.push(entry)
  })
  return [...entriesByVolume]
    .map(([volume, volumeEntries]) => buildVolumeGroup(volume, volumeEntries))
    .sort(
      (first, second) =>
        afoVolumeSortKey(second.volume) - afoVolumeSortKey(first.volume),
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
  const details = [afoVolumeLabel(group), group.pageRange]
    .filter((part) => part !== '')
    .join(', ')
  return { mainWord, details }
}
