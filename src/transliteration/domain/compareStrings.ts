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
  word: string,
  anotherWord: string
): number {
  const replacedWord = replaceIgnoredCharacters(word)
  const anotherWordReplaced = replaceIgnoredCharacters(anotherWord)
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
