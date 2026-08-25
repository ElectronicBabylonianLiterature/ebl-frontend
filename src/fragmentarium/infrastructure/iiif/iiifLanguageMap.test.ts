import {
  hasLanguageMapContent,
  resolveLanguageMap,
  resolveLanguageMapEntries,
  resolveLanguageMapText,
} from 'fragmentarium/infrastructure/iiif/iiifLanguageMap'

test('resolves an exact preferred language', () => {
  expect(resolveLanguageMap({ en: ['English'], de: ['Deutsch'] })).toBe(
    'English',
  )
})

test('resolves by primary subtag when the exact tag is absent', () => {
  expect(resolveLanguageMap({ 'en-GB': ['Colour'] })).toBe('Colour')
})

test('prefers an exact match over a primary subtag match', () => {
  expect(resolveLanguageMap({ 'en-GB': ['Colour'], en: ['Color'] })).toBe(
    'Color',
  )
})

test('falls back to the none key', () => {
  expect(resolveLanguageMap({ none: ['K.1'], de: ['Keilschrift'] })).toBe('K.1')
})

test('falls back to the first available entry', () => {
  expect(resolveLanguageMap({ de: ['Keilschrift'], ar: ['نص'] })).toBe(
    'Keilschrift',
  )
})

test('honours an explicit preferred language list', () => {
  expect(
    resolveLanguageMap({ en: ['English'], de: ['Deutsch'] }, ['de', 'en']),
  ).toBe('Deutsch')
})

test.each([
  [undefined],
  [null],
  ['string'],
  [[]],
  [{}],
  [{ en: 'not an array' }],
  [{ en: [] }],
  [{ en: [1, null] }],
])('returns undefined for %p', (value) => {
  expect(resolveLanguageMap(value)).toBeUndefined()
})

test('skips empty entries and keeps searching', () => {
  expect(resolveLanguageMap({ en: [], de: ['Deutsch'] })).toBe('Deutsch')
})

test('skips a non-preferred subtag with no content', () => {
  expect(
    resolveLanguageMapEntries({ 'en-GB': [], none: ['Fallback'] }),
  ).toEqual(['Fallback'])
})

test('resolveLanguageMapEntries returns every value', () => {
  expect(resolveLanguageMapEntries({ en: ['One', 'Two'] })).toEqual([
    'One',
    'Two',
  ])
})

test('resolveLanguageMapText joins values with newlines', () => {
  expect(resolveLanguageMapText({ en: ['One', 'Two'] })).toBe('One\nTwo')
  expect(resolveLanguageMapText({})).toBeUndefined()
})

test('hasLanguageMapContent detects resolvable content', () => {
  expect(hasLanguageMapContent({ zz: ['value'] })).toBe(true)
  expect(hasLanguageMapContent({ zz: [] })).toBe(false)
  expect(hasLanguageMapContent('string')).toBe(false)
})
