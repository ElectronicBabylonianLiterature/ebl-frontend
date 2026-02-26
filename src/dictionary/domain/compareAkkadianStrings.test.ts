import compareAkkadianStrings, {
  compareCleanedAkkadianString,
} from './compareAkkadianStrings'

test.each([
  ['Abullu', 'abullu', -1],
  ['abullu', 'Abullu', 1],
  ['Abullu', 'Ābullu', -1],
  ['Ābullu', 'Abullu', 1],
  ['Âbullu', 'Ābullu', 1],
  ['abullu₄', 'abullu', 1],
  ['bba', 'aba', 1],
  ['šab', 'ṣab', 1],
  ['arā', 'abâ', 1],
  ['abu', 'aba', 1],
  ['abu', 'abu', 0],
  ['abû', 'abū', 1],
  ['abu[', 'abum', -1],
  ['abum', 'abu', 1],
  ['abuma', 'abu', 1],
  ['abu', 'abama', 1],
  ['abu', '', 1],
  ['', '', 0],
  ['KUR.KUR', 'KUR-KUR?', 0],
  ['Amar-Suen', 'Amar-Suen?', 0],
  ['[Uruk]', '[Uruk]?', 0],
  ['šaniš', 'šan iš', -1],
  ['abu', "ab'u", 0],
  ['abʾu', 'abu', 0],
  ['abux', 'abu', 0],
  ['abuX', 'abu', 0],
  ['abuc', 'abu', 0],
  ['abuC', 'abu', 0],
  ['abuo', 'abu', 0],
  ['abuO', 'abu', 0],
])('compares %s and %s', (word, anotherWord, expected) => {
  const comparedWords = compareAkkadianStrings(word, anotherWord)
  expect(comparedWords).toBe(expected)
  const comparedWordsReversed = compareAkkadianStrings(anotherWord, word)
  if (expected !== 0) {
    expect(comparedWordsReversed).toBe(-expected)
  }
})

test.each([
  ['5Abullu', '5abullu', -1],
  ['9ab9ullu', 'Ab99ullu', 1],
])('compare cleaned %s and %s', (word, anotherWord, expected) => {
  expect(compareCleanedAkkadianString(word, anotherWord)).toBe(expected)
})

test.each([
  ['', 'abalu*', '*'],
  ['a&maru', 'bitu', '&'],
  ['belu\\EN', 'bitu', '\\'],
  ['EN=belu', 'amtu', '='],
  ['Amar|Suen', 'Hammurabi', '|'],
  ['matate;', 'amtu', ';'],
  ['bälu!', 'bitu', 'ä,!'],
  ['ḫarru', 'bjtu', 'ḫ,j'],
  ['belü!', 'byt(u)', 'ü,!,(,)'],
])(
  'throws an error on word(s) with invalid character(s) %s or %s',
  (word, anotherWord, invalidCharacters) => {
    function compareInvalidWords(): void {
      compareAkkadianStrings(word, anotherWord)
    }
    expect(compareInvalidWords).toThrowError(
      `Invalid character(s) ${invalidCharacters} in the input`,
    )
  },
)
