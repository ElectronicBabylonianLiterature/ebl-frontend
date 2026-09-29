import {
  createSearchFormState,
  flattenSearchFormState,
  isValidNumber,
} from 'fragmentarium/ui/SearchFormState'

it('creates the default state for an empty query', () => {
  expect(createSearchFormState({})).toEqual({
    number: null,
    referenceEntry: { id: '', label: '' },
    pages: null,
    lemmas: '',
    lemmaOperator: 'line',
    transliteration: '',
    scriptPeriod: '',
    scriptPeriodModifier: '',
    genre: '',
    site: '',
    isValid: true,
    project: null,
    museum: null,
    dossier: null,
  })
})

it('keeps the lemma operator and period modifier only with their values', () => {
  const state = createSearchFormState({
    lemmas: 'ina I',
    lemmaOperator: 'and',
    scriptPeriod: 'Neo-Assyrian',
    scriptPeriodModifier: 'Early',
    transliteration: 'ma  ',
  })

  expect(flattenSearchFormState(state)).toEqual({
    lemmas: 'ina I',
    lemmaOperator: 'and',
    scriptPeriod: 'Neo-Assyrian',
    scriptPeriodModifier: 'Early',
    transliteration: 'ma',
  })
  expect(
    flattenSearchFormState({ ...state, lemmas: '', scriptPeriod: '' }),
  ).toEqual({ transliteration: 'ma' })
})

it('omits empty transliterations and sites', () => {
  expect(
    flattenSearchFormState({
      ...createSearchFormState({}),
      transliteration: null,
      site: null,
    }),
  ).toEqual({})
})

it('rejects bracketed numbers', () => {
  expect(isValidNumber('[X.1]')).toBe(false)
  expect(isValidNumber('X.1')).toBe(true)
})
