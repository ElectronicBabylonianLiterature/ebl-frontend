import replaceSpecialCharacters from './replaceSpecialCharacters'

test.each([
  ['c', 'š'],
  ['sz', 'š'],
  ['s,', 'ṣ'],
  ['ş', 'ṣ'],
  ['t,', 'ṭ'],
  ['ḫ', 'h'],
  ['j', 'g'],
  ['ŋ', 'g'],
  ['ĝ', 'g'],
  ['g̃', 'g'],
  ['C', 'Š'],
  ['SZ', 'Š'],
  ['S,', 'Ṣ'],
  ['Ş', 'Ṣ'],
  ['T,', 'Ṭ'],
  ['Ḫ', 'H'],
  ['J', 'G'],
  ['Ŋ', 'G'],
  ['G̃', 'G'],
  ['Ĝ', 'G'],
  ["'", 'ʾ'],
  [
    "SZA ḫa'-t,i u ma-ŋi-cu' G̃A s,u'-lu-mu at-ta-şi-szu",
    'ŠA haʾ-ṭi u ma-gi-šuʾ GA ṣuʾ-lu-mu at-ta-ṣi-šu',
  ],
])('%s', (character, replacement) => {
  const text = replaceSpecialCharacters(character)
  expect(text).toEqual(replacement)
})
