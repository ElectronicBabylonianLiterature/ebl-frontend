import _ from 'lodash'
import alphabet from './alphabet.json'

function replaceIgnoredCharacters(word: string): string {
  return word.replace(/\]|\?|\[|-|\]|\./g, '')
}

function checkForInvalidCharacters(...words: string[]): void {
  const invalidCharacters = words
    .flatMap((word) => word.split(''))
    .filter((character) => !alphabet.includes(character))
  if (!_.isEmpty(invalidCharacters)) {
    throw new Error(`Invalid character(s) ${invalidCharacters} in the input`)
  }
}

function compareAlphabet(word: string, anotherWord: string): number {
  return alphabet.indexOf(word) - alphabet.indexOf(anotherWord)
}

export default function compareStrings(
  word: string,
  anotherWord: string
): number {
  const replacedWord = replaceIgnoredCharacters(word)
  const anotherWordReplaced = replaceIgnoredCharacters(anotherWord)
  checkForInvalidCharacters(replacedWord, anotherWordReplaced)

  return (
    _(replacedWord)
      .split('')
      .zipWith(anotherWordReplaced.split(''), compareAlphabet)
      .filter((result) => result !== 0)
      .map(Math.sign)
      .head() ?? Math.sign(replacedWord.length - anotherWordReplaced.length)
  )
}
