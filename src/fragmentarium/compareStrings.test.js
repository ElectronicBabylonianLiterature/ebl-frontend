import compareStrings from './compareStrings'

test.each([
  ['Abullu', 'abullu', -1],
  ['abullu', 'Abullu', 1],
  ['Abullu', 'Ābullu', -1],
  ['Ābullu', 'Abullu', 1],
  ['Ābullu', 'Âbullu', -1],
  ['Âbullu', 'Ābullu', 1],
  ['abullu', 'abullu₄', -1],
  ['abullu₄', 'abullu', 1],
  ['aba', 'bba', -1],
  ['bba', 'aba', 1],
  ['šab', 'ṣab', 1],
  ['ṣab', 'šab', -1],
  ['abâ', 'arā', -1],
  ['arā', 'abâ', 1],
  ['abu', 'aba', 1],
  ['aba', 'abu', -1],
  ['abu', 'abu', 0],
  ['abū', 'abû', -1],
  ['abû', 'abū', 1],
  ['abu', 'abum', -1],
  ['abum', 'abu', 1],
  ['abu', 'abuma', -1],
  ['abuma', 'abu', 1],
  ['abama', 'abu', -1],
  ['abu', 'abama', 1],
  ['', 'abu', -1],
  ['abu', '', 1],
  ['', '', 0]
])('compares %s and %s', (word, anotherWord, expected) => {
  const comparedWords = compareStrings(word, anotherWord)
  expect(comparedWords).toBe(expected)
})

test.each([
  ['', 2],
  [53, ''],
  [29, 98]
])('throws an error if the %s or %s is not a string', (word, anotherWord) => {
  function compareInvalidWords () {
    compareStrings(word, anotherWord)
  }
  expect(compareInvalidWords).toThrowError('The input is not a string')
})

test.each([
  ['  ', ' '],
  ['bälu', 'bitu'],
  ['ḫarru', 'bitu'],
  ['belü', 'bytu'],
  ['ü', '('],
  ['', 'abalu*'],
  ['[a]maru', 'bitu'],
  ['belu\\EN', 'bitu?'],
  ['\'belu\'', 'bitu'],
  ['EN=belu', 'amtu'],
  ['Amar-Suen', 'Hammurabi'],
  ['matate', 'KUR.KUR'],
  ['matate;', 'amtu']
])('throws an error on word(s) with invalid character(s) %s or %s', (word, anotherWord) => {
  function compareInvalidWords () {
    compareStrings(word, anotherWord)
  }
  expect(compareInvalidWords).toThrowError('Invalid character(s) in the input')
})
