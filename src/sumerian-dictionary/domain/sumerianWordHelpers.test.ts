import {
  formatCount,
  getEpsd2Url,
  getEtcslUrl,
  getSignSpellings,
  getUniquePeriods,
  getWordTitle,
  hasEblSignPage,
  sortEpsd2FormsByCount,
  splitCitationForm,
} from 'sumerian-dictionary/domain/sumerianWordHelpers'
import {
  getAlignmentLabel,
  getPartOfSpeechCode,
  getPartOfSpeechLabel,
} from 'sumerian-dictionary/domain/sumerianDictionaryLabels'
import { signEntryFactory } from 'test-support/sumerian-dictionary-fixtures'

describe('getWordTitle', () => {
  it.each([
    ['lugal', 'I', 'lugal I'],
    ['lugal', '', 'lugal'],
  ])('%s %s', (citationForm, homonym, expected) => {
    expect(getWordTitle({ citationForm, homonym })).toEqual(expected)
  })
})

describe('splitCitationForm', () => {
  it('marks braced determinatives', () => {
    expect(splitCitationForm('{ĝeš}sar-{d}en')).toEqual([
      { text: 'ĝeš', determinative: true },
      { text: 'sar-', determinative: false },
      { text: 'd', determinative: true },
      { text: 'en', determinative: false },
    ])
  })

  it('keeps a form without determinatives whole', () => {
    expect(splitCitationForm('du₁₁-g')).toEqual([
      { text: 'du₁₁-g', determinative: false },
    ])
  })
})

it('sorts ePSD2 forms most frequent first', () => {
  const forms = [
    { spelling: 'a', count: 1, percent: 1 },
    { spelling: 'b', count: 9, percent: 90 },
  ]
  expect(sortEpsd2FormsByCount(forms).map((form) => form.spelling)).toEqual([
    'b',
    'a',
  ])
})

it('de-duplicates periods in stored order', () => {
  expect(getUniquePeriods(['Ur III', 'Old Babylonian', 'Ur III'])).toEqual([
    'Ur III',
    'Old Babylonian',
  ])
})

it('joins the spellings of one source', () => {
  const sign = signEntryFactory.build({
    sources: [
      { source: 'attinger', spelling: 'lugal' },
      { source: 'epsd2', spelling: 'lu-gal' },
      { source: 'attinger', spelling: 'lugal₂' },
    ],
  })
  expect(getSignSpellings(sign, 'attinger')).toEqual('lugal, lugal₂')
  expect(getSignSpellings(sign, 'epsd2')).toEqual('lu-gal')
})

describe('hasEblSignPage', () => {
  it.each([
    [{ signList: 'ebl' as const }, true],
    [{ signList: 'ogsl' as const }, false],
    [{ signList: '' as const }, false],
    [{ signList: 'ebl' as const, unresolved: true }, false],
    [{ signList: 'ebl' as const, name: '' }, false],
  ])('%j', (overrides, expected) => {
    expect(hasEblSignPage(signEntryFactory.build(overrides))).toBe(expected)
  })
})

it('builds external links', () => {
  expect(getEtcslUrl('1.8.2.3')).toEqual(
    'https://etcsl.orinst.ox.ac.uk/cgi-bin/etcsl.cgi?text=c.1.8.2.3',
  )
  expect(getEpsd2Url('o0033341')).toEqual(
    'https://oracc.museum.upenn.edu/epsd2/o0033341',
  )
})

it('encodes the ids in external links', () => {
  expect(getEtcslUrl('1.8 & 2#3')).toEqual(
    'https://etcsl.orinst.ox.ac.uk/cgi-bin/etcsl.cgi?text=c.1.8%20%26%202%233',
  )
  expect(getEpsd2Url('o1/x#y')).toEqual(
    'https://oracc.museum.upenn.edu/epsd2/o1%2Fx%23y',
  )
})

it('formats counts with English grouping', () => {
  expect(formatCount(181438)).toEqual('181,438')
})

describe('part of speech', () => {
  it.each([
    [{ pos: 'V/t', attingerPos: 'V' }, 'V/t', 'Transitive verb'],
    [{ pos: '', attingerPos: 'ADJ' }, 'ADJ', 'ADJ'],
    [{ pos: '', attingerPos: '' }, '', ''],
  ])('%j', (word, code, label) => {
    expect(getPartOfSpeechCode(word)).toEqual(code)
    expect(getPartOfSpeechLabel(word)).toEqual(label)
  })
})

it.each([
  ['exact', 'Attinger and ePSD2 agree on the spelling and part of speech'],
  ['unknown-tier', 'unknown-tier'],
])('labels the alignment tier %s', (tier, label) => {
  expect(getAlignmentLabel(tier)).toEqual(label)
})
