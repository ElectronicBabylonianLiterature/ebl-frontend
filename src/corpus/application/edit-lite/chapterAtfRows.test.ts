import {
  isHeaderRow,
  isParatextRow,
  isReconstructionExtensionRow,
  isTranslationRow,
  parseManuscriptRow,
  parseReconstructionRow,
} from 'corpus/application/edit-lite/chapterAtfRows'

describe('row kinds', () => {
  it.each([
    ['&X000001 = L I.2 Poem of Creation SB I', true],
    ['#project: eblo', true],
    ['#atf: use unicode', true],
    ['#tr.en: When on high', false],
    ['1. %n enūma', false],
  ])('isHeaderRow(%s) is %s', (row, expected) => {
    expect(isHeaderRow(row)).toBe(expected)
  })

  it.each([
    ['#tr.en: When on high', true],
    ['#tr.ar.(o iii 1): extent', true],
    ['#tr: no language', true],
    ['#transliteration', false],
    ['#note: a note', false],
  ])('isTranslationRow(%s) is %s', (row, expected) => {
    expect(isTranslationRow(row)).toBe(expected)
  })

  it.each([
    ['#note: a note', true],
    ['// cf. L I.9 SB "II" 35-36', true],
    ['$ single ruling', false],
    ['NinNA1a o 1. kur', false],
  ])('isReconstructionExtensionRow(%s) is %s', (row, expected) => {
    expect(isReconstructionExtensionRow(row)).toBe(expected)
  })

  it.each([
    ['#note: a note', true],
    ['$ single ruling', true],
    ['// cf. L I.9 SB "II" 35-36', false],
    ['NinNA1a o 1. kur', false],
  ])('isParatextRow(%s) is %s', (row, expected) => {
    expect(isParatextRow(row)).toBe(expected)
  })
})

describe('parseReconstructionRow', () => {
  it.each([
    ['1. %n enūma | eliš', '1', '%n enūma | eliš'],
    ["12'. kur", "12'", 'kur'],
    ['a+3′b. kur ', 'a+3′b', 'kur'],
    ['22b-23a. kur', '22b-23a', 'kur'],
    ["1'-2’. kur", "1'-2’", 'kur'],
    ['7ʾ.', '7ʾ', ''],
    ['7.  ', '7', ''],
  ])('parses %s', (row, number, text) => {
    expect(parseReconstructionRow(row)).toEqual({ number, text })
  })

  it.each([
    ['40. %n [ ... ] mūšiš lū nēhet', '%n [...] mūšiš lū nēhet'],
    [
      '1. %n buāru (|) [ ... || ...]-buāru#',
      '%n buāru (|) [... || ...]-buāru#',
    ],
    ['1. %n [ ( ... ) ] kur', '%n [(...)] kur'],
    ['1. %n kur (|) [ ... ] (||) ( ... )', '%n kur (|) [...] (||) (...)'],
    ['1. %n < ( ... ) > | [ ...', '%n <(...)> | [...'],
    ['1. %n ... ] kur-[...]', '%n ...] kur-[...]'],
    ['1. %n [  ...\t] kur  ra', '%n [...] kur ra'],
    ['1. %n [...] mūšiš lū nēhet', '%n [...] mūšiš lū nēhet'],
    [
      '1. %n enūma | eliš || lā nabû | šamāmū',
      '%n enūma | eliš || lā nabû | šamāmū',
    ],
  ])('spells the enclosures of %s like the edit API', (row, text) => {
    expect(parseReconstructionRow(row)?.text).toBe(text)
  })

  it.each([
    ['NinNA1a o 1. kur'],
    ['#tr.en: 1. kur'],
    ['1.kur'],
    ['1 kur'],
    ['i. kur'],
    ['1-. kur'],
    [''],
  ])('rejects %s', (row) => {
    expect(parseReconstructionRow(row)).toBeNull()
  })
})

describe('parseManuscriptRow', () => {
  it.each([
    [
      'NinNA1a o 1. e#-nu-ma# [e]-liš#',
      {
        siglum: 'NinNA1a',
        labels: ['o'],
        number: '1',
        text: 'e#-nu-ma# [e]-liš#',
      },
    ],
    [
      "BabaNBSch1 o 6'. [x x x] e-li-[iš x]",
      {
        siglum: 'BabaNBSch1',
        labels: ['o'],
        number: "6'",
        text: '[x x x] e-li-[iš x]',
      },
    ],
    [
      'BabLB3 o i 1′. [al-s]i  ba#-[ra-ri-tum]',
      {
        siglum: 'BabLB3',
        labels: ['o', 'i'],
        number: '1′',
        text: '[al-s]i  ba#-[ra-ri-tum]',
      },
    ],
    [
      'AššNA1a b.e. r? 4b-5. kur 12. ra',
      {
        siglum: 'AššNA1a',
        labels: ['b.e.', 'r?'],
        number: '4b-5',
        text: 'kur 12. ra',
      },
    ],
    [
      'HuzNA1 a+40-41. ša₂',
      { siglum: 'HuzNA1', labels: [], number: 'a+40-41', text: 'ša₂' },
    ],
    [
      'NinNACom1 o 1a.',
      { siglum: 'NinNACom1', labels: ['o'], number: '1a', text: '' },
    ],
    [
      '  SipNB2\to\t2.\t[ša]p-liš  ',
      { siglum: 'SipNB2', labels: ['o'], number: '2', text: '[ša]p-liš' },
    ],
  ])('parses %s', (row, expected) => {
    expect(parseManuscriptRow(row)).toEqual(expected)
  })

  it.each([
    ['NinNA1a o kur ra'],
    ['1. %n enūma | eliš'],
    ['NinNA1a o 1.5. kur'],
    ['#note: see NinNA1a o 1. kur'],
    ['$ NinNA1a o 1. kur'],
    ['// F K.1 o 1. kur'],
    ['&X000001 = L 1. kur'],
    ['@obverse o 1. kur'],
    ['NinNA1a'],
    [''],
  ])('rejects %s', (row) => {
    expect(parseManuscriptRow(row)).toBeNull()
  })
})
