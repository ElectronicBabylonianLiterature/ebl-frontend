import _ from 'lodash'
import { PeriodModifiers } from 'common/utils/period'
import { Manuscript } from 'corpus/domain/manuscript'

export interface ManuscriptSummary {
  readonly siglum: string
  readonly museumNumber: string
  readonly period: string
  readonly provenance: string
  readonly type: string
}

export interface ManuscriptColumn {
  readonly key: keyof ManuscriptSummary
  readonly caption: string
  readonly modifier: string
}

export const emptyManuscriptCell = '—'

export const manuscriptColumns: readonly ManuscriptColumn[] = [
  { key: 'siglum', caption: 'Siglum', modifier: 'siglum' },
  {
    key: 'museumNumber',
    caption: 'Museum number',
    modifier: 'museum-number',
  },
  { key: 'period', caption: 'Period', modifier: 'period' },
  { key: 'provenance', caption: 'Provenance', modifier: 'provenance' },
  { key: 'type', caption: 'Type', modifier: 'type' },
]

function describePeriod(manuscript: Manuscript): string {
  const period = manuscript.period.displayName ?? manuscript.period.name
  return manuscript.periodModifier.name === PeriodModifiers.None.name
    ? period
    : `${manuscript.periodModifier.displayName} ${period}`
}

export function summarizeManuscript(manuscript: Manuscript): ManuscriptSummary {
  return {
    siglum: manuscript.siglum || emptyManuscriptCell,
    museumNumber:
      manuscript.museumNumber || manuscript.accession || emptyManuscriptCell,
    period: describePeriod(manuscript),
    provenance: manuscript.provenance.name,
    type: manuscript.type.displayName ?? manuscript.type.name,
  }
}

export function isManuscriptEdited(
  original: Manuscript,
  current: Manuscript,
): boolean {
  return !_.isEqual(original, current)
}
