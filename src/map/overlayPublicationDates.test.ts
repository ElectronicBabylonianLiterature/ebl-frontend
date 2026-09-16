import { historicalMapOverlay } from 'test-support/map-fixtures'
import {
  parsePublicationDate,
  publicationDateDescription,
  publicationYearExtent,
  toDatedOverlays,
} from './overlayPublicationDates'

describe('parsePublicationDate', () => {
  it.each([
    ['1938', 1938],
    ['1954', 1954],
    ['2017', 2017],
    ['1500', 1500],
  ])('reads %s as an exact year', (label, year) => {
    expect(parsePublicationDate(label)).toEqual({
      kind: 'exact-year',
      label,
      startYear: year,
      endYear: year,
    })
  })

  it.each([
    ['1936-1938', 1936, 1938],
    ['1936–1938', 1936, 1938],
    ['1936—1938', 1936, 1938],
    ['1936/1938', 1936, 1938],
    ['1936 - 38', 1936, 1938],
    ['1938-1938', 1938, 1938],
  ])('reads %s as a year range', (label, startYear, endYear) => {
    expect(parsePublicationDate(label)).toEqual({
      kind: 'year-range',
      label,
      startYear,
      endYear,
    })
  })

  it.each([
    'c. 1938',
    'c1938',
    'ca. 1938',
    'ca 1938',
    '~1938',
    'about 1938',
    'circa 1938',
  ])('reads %s as approximate', (label) => {
    expect(parsePublicationDate(label)).toMatchObject({
      kind: 'approximate',
      startYear: 1938,
      endYear: 1938,
    })
  })

  it.each([undefined, '', '   '])('reads %s as unknown', (label) => {
    expect(parsePublicationDate(label)).toEqual({
      kind: 'unknown',
      label: null,
      startYear: null,
      endYear: null,
    })
  })

  it.each([
    '2323',
    '2747',
    '1200',
    'c. 2323',
    '2323-2747',
    '1938-1200',
    '1990-1980',
    'Beilage',
    '12345',
  ])('refuses to treat %s as a publication year', (label) => {
    expect(parsePublicationDate(label)).toEqual({
      kind: 'invalid',
      label,
      startYear: null,
      endYear: null,
    })
  })
})

describe('toDatedOverlays', () => {
  it('classifies every overlay it is given', () => {
    const dated = toDatedOverlays([
      historicalMapOverlay({ id: 'a', dateLabel: '1938' }),
      historicalMapOverlay({ id: 'b', dateLabel: '2323' }),
      historicalMapOverlay({ id: 'c', dateLabel: undefined }),
    ])

    expect(dated.map(({ date }) => date.kind)).toEqual([
      'exact-year',
      'invalid',
      'unknown',
    ])
  })
})

describe('publicationYearExtent', () => {
  it('spans only the overlays with plausible years', () => {
    const extent = publicationYearExtent(
      toDatedOverlays([
        historicalMapOverlay({ id: 'a', dateLabel: '1938' }),
        historicalMapOverlay({ id: 'b', dateLabel: '1954-1955' }),
        historicalMapOverlay({ id: 'c', dateLabel: '2747' }),
        historicalMapOverlay({ id: 'd', dateLabel: undefined }),
      ]),
    )

    expect(extent).toEqual({ earliestYear: 1938, latestYear: 1955 })
  })

  it('is null when nothing carries a usable year', () => {
    expect(
      publicationYearExtent(
        toDatedOverlays([
          historicalMapOverlay({ id: 'a', dateLabel: '2323' }),
          historicalMapOverlay({ id: 'b', dateLabel: undefined }),
        ]),
      ),
    ).toBeNull()
  })
})

describe('publicationDateDescription', () => {
  it.each([
    ['1938', 'Published 1938'],
    ['1954-1955', 'Published 1954–1955'],
    ['c. 1938', 'Published approximately 1938'],
    [undefined, 'Publication date unknown'],
    ['2323', 'Publication date not established (recorded as “2323”)'],
  ])('describes %s honestly', (label, expected) => {
    expect(publicationDateDescription(parsePublicationDate(label))).toBe(
      expected,
    )
  })
})
