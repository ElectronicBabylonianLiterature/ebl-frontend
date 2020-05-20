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

function compareAlphabetAtIndex(
  word: string,
  anotherWord: string,
  index: number
): number {
  return alphabet.indexOf(word[index]) - alphabet.indexOf(anotherWord[index])
}

export default function compareStrings(
  word: string,
  anotherWord: string
): number {
  const replacedWord = replaceIgnoredCharacters(word)
  const anotherWordReplaced = replaceIgnoredCharacters(anotherWord)
  checkForInvalidCharacters(replacedWord, anotherWordReplaced)

  const indices = _.range(
    Math.min(replacedWord.length, anotherWordReplaced.length)
  )
  return (
    _(indices)
      .map((index) =>
        compareAlphabetAtIndex(replacedWord, anotherWordReplaced, index)
      )
      .filter((result) => result !== 0)
      .map(Math.sign)
      .head() ?? Math.sign(replacedWord.length - anotherWordReplaced.length)
  )
}
