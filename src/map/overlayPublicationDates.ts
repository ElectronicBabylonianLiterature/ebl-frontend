import type { HistoricalMapOverlay } from './historicalOverlays'

export const EARLIEST_PLAUSIBLE_PUBLICATION_YEAR = 1500

export type PublicationDateKind =
  | 'exact-year'
  | 'year-range'
  | 'approximate'
  | 'unknown'
  | 'invalid'

export interface PublicationDate {
  readonly kind: PublicationDateKind
  readonly label: string | null
  readonly startYear: number | null
  readonly endYear: number | null
}

const RANGE_PATTERN = /^(\d{3,4})\s*[-–—/]\s*(\d{2,4})$/
const APPROXIMATE_PATTERN = /^(?:c\.?|ca\.?|~|about|circa)\s*(\d{3,4})$/i
const EXACT_PATTERN = /^(\d{3,4})$/

const UNKNOWN: PublicationDate = {
  kind: 'unknown',
  label: null,
  startYear: null,
  endYear: null,
}

function latestPlausibleYear(): number {
  return new Date().getUTCFullYear()
}

function isPlausibleYear(year: number): boolean {
  return (
    year >= EARLIEST_PLAUSIBLE_PUBLICATION_YEAR && year <= latestPlausibleYear()
  )
}

function invalid(label: string): PublicationDate {
  return { kind: 'invalid', label, startYear: null, endYear: null }
}

function expandEndYear(startYear: number, rawEnd: string): number {
  return rawEnd.length >= 3
    ? Number(rawEnd)
    : Math.floor(startYear / 100) * 100 + Number(rawEnd)
}

function parseRange(label: string): PublicationDate | null {
  const match = RANGE_PATTERN.exec(label)
  if (!match) return null

  const startYear = Number(match[1])
  const endYear = expandEndYear(startYear, match[2])

  return isPlausibleYear(startYear) &&
    isPlausibleYear(endYear) &&
    endYear >= startYear
    ? { kind: 'year-range', label, startYear, endYear }
    : invalid(label)
}

function parseSingle(
  label: string,
  pattern: RegExp,
  kind: 'exact-year' | 'approximate',
): PublicationDate | null {
  const match = pattern.exec(label)
  if (!match) return null

  const year = Number(match[1])
  return isPlausibleYear(year)
    ? { kind, label, startYear: year, endYear: year }
    : invalid(label)
}

/**
 * Classifies an overlay's publication date label. Values outside the plausible
 * publication window — the generator derives some labels from source-filename
 * record numbers such as `rn2323` — are reported as `invalid` and never plotted
 * as if they were years.
 */
export function parsePublicationDate(
  dateLabel: string | undefined,
): PublicationDate {
  const label = dateLabel?.trim() ?? ''
  if (label === '') return UNKNOWN

  return (
    parseRange(label) ??
    parseSingle(label, APPROXIMATE_PATTERN, 'approximate') ??
    parseSingle(label, EXACT_PATTERN, 'exact-year') ??
    invalid(label)
  )
}

export interface DatedOverlay {
  readonly overlay: HistoricalMapOverlay
  readonly date: PublicationDate
}

export function toDatedOverlays(
  overlays: readonly HistoricalMapOverlay[],
): readonly DatedOverlay[] {
  return overlays.map((overlay) => ({
    overlay,
    date: parsePublicationDate(overlay.dateLabel),
  }))
}

export interface PublicationYearExtent {
  readonly earliestYear: number
  readonly latestYear: number
}

export function publicationYearExtent(
  dated: readonly DatedOverlay[],
): PublicationYearExtent | null {
  const years = dated.flatMap(({ date }) =>
    date.startYear === null || date.endYear === null
      ? []
      : [date.startYear, date.endYear],
  )

  return years.length === 0
    ? null
    : { earliestYear: Math.min(...years), latestYear: Math.max(...years) }
}

export function publicationDateDescription(date: PublicationDate): string {
  switch (date.kind) {
    case 'exact-year':
      return `Published ${date.startYear}`
    case 'year-range':
      return `Published ${date.startYear}–${date.endYear}`
    case 'approximate':
      return `Published approximately ${date.startYear}`
    case 'invalid':
      return `Publication date not established (recorded as “${date.label}”)`
    default:
      return 'Publication date unknown'
  }
}
