import Cite from 'citation-js'
import { CslData } from 'bibliography/domain/BibliographyEntry'

const doiApiStep = '@doi/api'

interface ParseStep {
  readonly type: string
}

interface ParsedRecord {
  readonly _graph?: ReadonlyArray<ParseStep>
}

function wasImportedFromDoi(parsedRecord: ParsedRecord): boolean {
  return (parsedRecord._graph ?? []).some((step) => step.type === doiApiStep)
}

function isSingleDoiImport(
  cite: Cite,
  cslData: ReadonlyArray<CslData>,
): boolean {
  return cslData.length === 1 && wasImportedFromDoi(cite.data[0])
}

function removeShortTitlesFromJournalArticle(entry: CslData): CslData {
  if (entry.type !== 'article-journal') {
    return entry
  }
  const entryWithoutShortTitles = { ...entry }
  delete entryWithoutShortTitles['container-title-short']
  delete entryWithoutShortTitles['title-short']
  return entryWithoutShortTitles
}

export function normalizeImportedCslData(
  cite: Cite,
  cslData: ReadonlyArray<CslData>,
): ReadonlyArray<CslData> {
  return isSingleDoiImport(cite, cslData)
    ? cslData.map(removeShortTitlesFromJournalArticle)
    : cslData
}
