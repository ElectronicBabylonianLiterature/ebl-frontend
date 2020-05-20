import _ from 'lodash'
import alphabet from './alphabet.json'

function isString(word: unknown, anotherWord: unknown): void {
  const notStrings = [word, anotherWord].filter((word) => !_.isString(word))
  if (!_.isEmpty(notStrings)) {
    throw new TypeError(`${notStrings} is not a string`)
  }
}

function replaceIgnoredCharacters(word: string): string {
  return word.replace(/\]|\?|\[|-|\]|\./g, '')
}

function checkForInvalidCharacters(word: string, anotherWord: string): void {
  const invalidCharacters = word
    .split('')
    .concat(anotherWord.split(''))
    .filter((character) => !alphabet.includes(character))
  if (!_.isEmpty(invalidCharacters)) {
    throw new Error(`Invalid character(s) ${invalidCharacters} in the input`)
  }
}

function hasHigherAlphabetIndex(
  word: string,
  anotherWord: string,
  indexOfCharacter: number
): boolean {
  return (
    alphabet.indexOf(word[indexOfCharacter]) >
    alphabet.indexOf(anotherWord[indexOfCharacter])
  )
}

function hasLowerAlphabetIndex(
  word: string,
  anotherWord: string,
  indexOfCharacter: number
): boolean {
  return (
    alphabet.indexOf(word[indexOfCharacter]) <
    alphabet.indexOf(anotherWord[indexOfCharacter])
  )
}

export default function compareStrings(
  word: unknown,
  anotherWord: unknown
): number {
  isString(word, anotherWord)
  const replacedWord = replaceIgnoredCharacters(word as string)
  const anotherWordReplaced = replaceIgnoredCharacters(anotherWord as string)
  checkForInvalidCharacters(replacedWord, anotherWordReplaced)

  for (
    let indexOfCharacter = 0;
    indexOfCharacter < replacedWord.length;
    indexOfCharacter++
  ) {
    if (
      hasHigherAlphabetIndex(
        replacedWord,
        anotherWordReplaced,
        indexOfCharacter
      )
    ) {
      return 1
    } else if (
      hasLowerAlphabetIndex(replacedWord, anotherWordReplaced, indexOfCharacter)
    ) {
      return -1
    }
  }
  return Math.sign(replacedWord.length - anotherWordReplaced.length)
}
