import _ from 'lodash'
import alphabet from './alphabet.json'

const ignoredCharacters: readonly string[] = [
  'ʾ',
  "'",
  ']',
  '?',
  '[',
  '-',
  ']',
  '.',
]

const ignoredRegExp = new RegExp(
  _(ignoredCharacters).map(_.escapeRegExp).join('|'),
  'g'
)

function removeIgnoredCharacters(word: string): string {
  return word.replace(ignoredRegExp, '')
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

export default function compareAkkadianStrings(
  word: string,
  anotherWord: string
): number {
  const replacedWord = removeIgnoredCharacters(word)
  const anotherWordReplaced = removeIgnoredCharacters(anotherWord)
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
