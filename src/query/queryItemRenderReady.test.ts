import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { queryItemFactory } from 'test-support/query-item-factory'
import {
  getLatestTransliterationRecord,
  hasLatestTransliterationRecord,
  hasPrefetchableFullFragment,
  hasRenderReadyFragment,
  hasUnsupportedFragmentCardSummary,
} from 'query/queryItemRenderReady'

const currentTransliteration = new RecordEntry({
  user: 'Current',
  date: '2020-01-01T10:00:00.000000',
  type: 'Transliteration',
})
const olderTransliteration = new RecordEntry({
  user: 'Older',
  date: '2015-01-01T10:00:00.000000',
  type: 'Transliteration',
})
const historical = new RecordEntry({
  user: 'Historical',
  date: '1998-01-17T10:50:36.127247/1999-04-17T10:29:39.127247',
  type: 'HistoricalTransliteration',
})
const revision = new RecordEntry({
  user: 'Reviser',
  date: '2021-01-01T10:00:00.000000',
  type: 'Revision',
})
const collation = new RecordEntry({
  user: 'Collator',
  date: '2022-01-01T10:00:00.000000',
  type: 'Collation',
})

function fragmentWithRecord(record: readonly RecordEntry[]) {
  return fragmentFactory.build({}, { associations: { record } })
}

describe('getLatestTransliterationRecord', () => {
  it.each([
    ['historical transliteration only', [historical], undefined],
    [
      'non-historical transliteration only',
      [currentTransliteration],
      currentTransliteration,
    ],
    [
      'historical first, non-historical later',
      [historical, currentTransliteration],
      currentTransliteration,
    ],
    [
      'non-historical first, historical later',
      [currentTransliteration, historical],
      currentTransliteration,
    ],
    [
      'non-transliteration records mixed in',
      [revision, historical, olderTransliteration, collation],
      olderTransliteration,
    ],
    ['no matching record', [revision, collation], undefined],
    ['no records at all', [], undefined],
  ])('selects the record for %s', (_name, record, expected) => {
    expect(getLatestTransliterationRecord(fragmentWithRecord(record))).toBe(
      expected,
    )
  })

  it('never returns a historical record when a current one exists', () => {
    const fragment = fragmentWithRecord([historical, currentTransliteration])

    expect(getLatestTransliterationRecord(fragment)?.isHistorical).toBe(false)
  })
})

describe('hasLatestTransliterationRecord', () => {
  it.each([
    [[historical], false],
    [[currentTransliteration], true],
    [[historical, currentTransliteration], true],
    [[currentTransliteration, historical], true],
    [[revision, collation], false],
    [[], false],
  ])('admits %o as %s', (record, expected) => {
    expect(hasLatestTransliterationRecord(fragmentWithRecord(record))).toBe(
      expected,
    )
  })

  it.each([
    [[historical]],
    [[currentTransliteration]],
    [[historical, currentTransliteration]],
    [[revision, collation]],
  ])(
    'agrees with the record the display uses for %o',
    (record: readonly RecordEntry[]) => {
      const fragment = fragmentWithRecord(record)

      expect(hasLatestTransliterationRecord(fragment)).toBe(
        getLatestTransliterationRecord(fragment) !== undefined,
      )
    },
  )
})

describe('hasRenderReadyFragment with includeLatestRecord', () => {
  it('rejects a fragment whose only transliteration record is historical', () => {
    const queryItem = {
      ...queryItemFactory.build(),
      fragment: fragmentWithRecord([historical]),
    }

    expect(
      hasRenderReadyFragment(queryItem, { includeLatestRecord: true }),
    ).toBe(false)
  })

  it.each([
    ['a historical-only record', [historical]],
    ['a current record', [currentTransliteration]],
    ['no record', []],
  ])(
    'ignores the transliteration rule for %s without options',
    (unusedName, record) => {
      const queryItem = {
        ...queryItemFactory.build(),
        fragment: fragmentWithRecord(record),
      }

      expect(hasRenderReadyFragment(queryItem)).toBe(true)
    },
  )

  it('rejects an item without a fragment', () => {
    expect(hasRenderReadyFragment(queryItemFactory.build())).toBe(false)
  })

  it('admits a fragment that also carries a historical record', () => {
    const queryItem = {
      ...queryItemFactory.build(),
      fragment: fragmentWithRecord([historical, currentTransliteration]),
    }

    expect(
      hasRenderReadyFragment(queryItem, { includeLatestRecord: true }),
    ).toBe(true)
  })
})

describe('summary classification helpers', () => {
  const base = queryItemFactory.build()

  it.each([
    [
      'an unsupported summary',
      { type: 'UnsupportedFragmentCardSummary' },
      true,
    ],
    ['a supported summary', { type: 'FragmentCardSummary' }, false],
    ['no summary', undefined, false],
  ] as const)('detects %s', (unusedName, cardSummary, expected) => {
    expect(hasUnsupportedFragmentCardSummary({ ...base, cardSummary })).toBe(
      expected,
    )
  })

  it('treats a prefetched full fragment as hydratable', () => {
    expect(
      hasPrefetchableFullFragment({
        ...base,
        fragment: fragmentWithRecord([currentTransliteration]),
      }),
    ).toBe(true)
  })

  it.each([
    ['a summary-backed fragment', { type: 'FragmentCardSummary' } as const],
    [
      'an unsupported summary',
      { type: 'UnsupportedFragmentCardSummary' } as const,
    ],
  ])('never prefetches %s', (unusedName, cardSummary) => {
    expect(
      hasPrefetchableFullFragment({
        ...base,
        fragment: fragmentWithRecord([currentTransliteration]),
        cardSummary,
      }),
    ).toBe(false)
  })

  it('never prefetches an item without a fragment', () => {
    expect(hasPrefetchableFullFragment(base)).toBe(false)
  })
})
