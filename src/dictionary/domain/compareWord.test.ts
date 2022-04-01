import { wordFactory } from 'test-support/word-fixtures'
import compareWord from './compareWord'

test.each([
  ['Abullu', 'abullu', -1],
  ['bba', 'aba', 1],
  ['abu', 'abu', 0],
  ['abu', 'abama', 1],
  ['šaniš', 'šan iš', -1],
])('compares %s and %s', async (lemma, anotherLemma, expected) => {
  const word = wordFactory.build({ lemma: lemma.split(' ') })
  const anotherWord = { ...word, lemma: anotherLemma.split(' ') }
  const comparedWords = compareWord(word, anotherWord)
  expect(comparedWords).toBe(expected)
  const comparedWordsReversed = compareWord(anotherWord, word)
  if (expected !== 0) {
    expect(comparedWordsReversed).toBe(-expected)
  }
})

test.each([
  ['I', 'I', 0],
  ['V', 'V', 0],
  ['I', 'II', -1],
  ['II', 'III', -1],
  ['III', 'IV', -1],
  ['V', 'VI', -1],
  ['VI', 'VII', -1],
])('compares homonyms %s and %s', async (homonym, anotherHomonym, expected) => {
  const word = wordFactory.build({
    lemma: ['abullu'],
    homonym: homonym,
  })
  const anotherWord = { ...word, homonym: anotherHomonym }
  const comparedWords = compareWord(word, anotherWord)
  expect(comparedWords).toBe(expected)
  const comparedWordsReversed = compareWord(anotherWord, word)
  if (expected !== 0) {
    expect(comparedWordsReversed).toBe(-expected)
  }
})
