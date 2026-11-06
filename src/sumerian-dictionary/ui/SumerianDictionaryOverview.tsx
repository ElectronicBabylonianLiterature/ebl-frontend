import React from 'react'
import withData from 'http/withData'
import SumerianDictionaryService from 'sumerian-dictionary/application/SumerianDictionaryService'
import {
  SumerianDictionaryStatistics,
  SumerianWordSummary,
} from 'sumerian-dictionary/domain/SumerianWordSummary'
import { formatCount } from 'sumerian-dictionary/domain/sumerianWordHelpers'
import SumerianDictionaryResultsList from 'sumerian-dictionary/ui/SumerianDictionaryResultsList'

export const featuredSumerianWordIds: readonly string[] = [
  'o0033341',
  'o0029228',
  'o0037222',
  'o0033207',
  'o0026343',
  'o0024854',
  'sux-006390',
  'o0030842',
  'o0040693',
  'sux-003830',
]

const statisticLabels: readonly (readonly [
  keyof SumerianDictionaryStatistics,
  string,
])[] = [
  ['lemmas', 'lemmas'],
  ['attinger', 'from Attinger'],
  ['aligned', 'aligned with ePSD2'],
  ['epsd2Only', 'ePSD2 only'],
  ['properNouns', 'proper nouns'],
  ['withAkkadian', 'with Akkadian equivalents'],
]

interface ServiceProps {
  sumerianDictionaryService: SumerianDictionaryService
}

export const SumerianDictionaryStatisticsBar = withData<
  unknown,
  ServiceProps,
  SumerianDictionaryStatistics
>(
  ({ data }): JSX.Element => (
    <ul className="SumerianDictionary__statistics" aria-label="Statistics">
      {statisticLabels.map(([key, label]) => (
        <li key={key} className="SumerianDictionary__statistic">
          <b>{formatCount(data[key])}</b> {label}
        </li>
      ))}
    </ul>
  ),
  ({ sumerianDictionaryService }, signal) =>
    sumerianDictionaryService.statistics(signal),
)

export const SumerianDictionaryFeaturedEntries = withData<
  unknown,
  ServiceProps,
  readonly SumerianWordSummary[]
>(
  ({ data }): JSX.Element => (
    <>
      <p className="SumerianDictionary__results-header">Selected entries</p>
      <SumerianDictionaryResultsList summaries={data} />
    </>
  ),
  ({ sumerianDictionaryService }, signal) =>
    sumerianDictionaryService.findSummaries(featuredSumerianWordIds, signal),
)
