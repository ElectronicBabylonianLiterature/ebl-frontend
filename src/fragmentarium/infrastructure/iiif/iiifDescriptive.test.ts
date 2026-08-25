import {
  normalizeExternalUrl,
  normalizeHomepage,
  normalizeMetadata,
  normalizeMetadataEntry,
  normalizeProvider,
  normalizeRights,
} from 'fragmentarium/infrastructure/iiif/iiifDescriptive'
import { maximumMetadataEntries } from 'fragmentarium/infrastructure/iiif/iiifValidation'
import {
  foreignOrigin,
  unsafeScriptUrl,
} from 'test-support/iiif-fixtures/iiifFixtures'

test('normalizes a metadata entry', () => {
  expect(
    normalizeMetadataEntry({
      label: { en: ['Museum'] },
      value: { en: ['BM'] },
    }),
  ).toEqual({ label: 'Museum', value: 'BM' })
})

test.each([
  ['not a record', 'string'],
  ['a missing label', { value: { en: ['BM'] } }],
  ['a missing value', { label: { en: ['Museum'] } }],
])('drops a metadata entry with %s', (unused, value) => {
  expect(normalizeMetadataEntry(value)).toBeUndefined()
})

test('normalizes metadata and drops invalid entries', () => {
  expect(
    normalizeMetadata([
      { label: { en: ['A'] }, value: { en: ['1'] } },
      'bad',
      { label: { en: ['B'] } },
    ]),
  ).toEqual([{ label: 'A', value: '1' }])
})

test('bounds the number of metadata entries', () => {
  const entries = Array.from({ length: maximumMetadataEntries + 5 }, () => ({
    label: { en: ['A'] },
    value: { en: ['1'] },
  }))
  expect(normalizeMetadata(entries)).toHaveLength(maximumMetadataEntries)
})

test('normalizes external urls from records and strings', () => {
  expect(normalizeExternalUrl({ id: 'https://example.com/a' })).toBe(
    'https://example.com/a',
  )
  expect(normalizeExternalUrl({ '@id': 'https://example.com/b' })).toBe(
    'https://example.com/b',
  )
  expect(normalizeExternalUrl('https://example.com/c')).toBe(
    'https://example.com/c',
  )
  expect(normalizeExternalUrl(unsafeScriptUrl)).toBeUndefined()
})

test('normalizes the first usable homepage', () => {
  expect(
    normalizeHomepage([
      { id: unsafeScriptUrl },
      { id: 'https://example.com/home' },
    ]),
  ).toBe('https://example.com/home')
  expect(normalizeHomepage([])).toBeUndefined()
})

test.each([
  [
    'https://creativecommons.org/licenses/by/4.0/',
    'https://creativecommons.org/licenses/by/4.0/',
  ],
  [
    'https://rightsstatements.org/vocab/InC/1.0/',
    'https://rightsstatements.org/vocab/InC/1.0/',
  ],
  [`${foreignOrigin}/licence`, undefined],
  ['http://creativecommons.org/licenses/by/4.0/', undefined],
  [unsafeScriptUrl, undefined],
  ['All rights reserved', undefined],
])('normalizeRights(%p)', (value, expected) => {
  expect(normalizeRights(value)).toBe(expected)
})

test('normalizes providers and drops unusable ones', () => {
  expect(
    normalizeProvider([
      {
        id: 'https://example.com/p',
        label: { en: ['Provider'] },
        homepage: [{ id: 'https://example.com/home' }],
      },
      { label: { en: ['No homepage'] } },
      { id: 'https://example.com/q' },
      'bad',
    ]),
  ).toEqual([
    {
      id: 'https://example.com/p',
      label: 'Provider',
      homepage: 'https://example.com/home',
    },
    { label: 'No homepage' },
  ])
})
