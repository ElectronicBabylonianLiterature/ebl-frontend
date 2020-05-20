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

  for (
    let indexOfCharacter = 0;
    indexOfCharacter < replacedWord.length;
    indexOfCharacter++
  ) {
    const alphabetResult = compareAlphabetAtIndex(
      replacedWord,
      anotherWordReplaced,
      indexOfCharacter
    )
    if (alphabetResult !== 0) {
      return Math.sign(alphabetResult)
    }
  }
  return Math.sign(replacedWord.length - anotherWordReplaced.length)
}
