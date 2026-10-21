import _ from 'lodash'
import {
  Epsd2Form,
  SignEntry,
  SumerianSource,
} from 'sumerian-dictionary/domain/SumerianWordParts'

export interface CitationFormPiece {
  readonly text: string
  readonly determinative: boolean
}

export function getWordTitle({
  citationForm,
  homonym,
}: {
  citationForm: string
  homonym: string
}): string {
  return [citationForm, homonym].filter(Boolean).join(' ')
}

export function splitCitationForm(
  citationForm: string,
): readonly CitationFormPiece[] {
  return citationForm
    .split(/(\{[^}]*\})/)
    .filter(Boolean)
    .map((part) =>
      /^\{[^}]*\}$/.test(part)
        ? { text: part.slice(1, -1), determinative: true }
        : { text: part, determinative: false },
    )
}

export function sortEpsd2FormsByCount(
  forms: readonly Epsd2Form[],
): readonly Epsd2Form[] {
  return _.orderBy(forms, (form) => form.count, 'desc')
}

export function getUniquePeriods(
  periods: readonly string[],
): readonly string[] {
  return _.uniq(periods)
}

export function getSignSpellings(
  sign: SignEntry,
  source: SumerianSource,
): string {
  return sign.sources
    .filter((cited) => cited.source === source)
    .map((cited) => cited.spelling)
    .join(', ')
}

export function hasEblSignPage(sign: SignEntry): boolean {
  return sign.signList === 'ebl' && !sign.unresolved && sign.name !== ''
}

export function getEtcslUrl(etcsl: string): string {
  return `https://etcsl.orinst.ox.ac.uk/cgi-bin/etcsl.cgi?text=c.${etcsl}`
}

export function getEpsd2Url(oid: string): string {
  return `https://oracc.museum.upenn.edu/epsd2/${oid}`
}

export function formatCount(count: number): string {
  return count.toLocaleString('en')
}
