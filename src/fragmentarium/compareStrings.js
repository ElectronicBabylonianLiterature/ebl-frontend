import _ from 'lodash'
import alphabet from './alphabet'

function isString (word, anotherWord) {
  let notStrings = [word, anotherWord].filter(word => !_.isString(word))
  if (!_.isEmpty(notStrings)) {
    throw new TypeError(`${notStrings} is not a string`)
  }
}

function replaceIgnoredCharacters (word) {
  return word.replace(/\]|\?|\[|-|\]|\./g, '')
}

function checkForInvalidCharacters (word, anotherWord) {
  let invalidCharacters = word.split('').concat(anotherWord.split('')).filter(character => !alphabet.includes(character))
  if (!_.isEmpty(invalidCharacters)) {
    throw new Error(`Invalid character(s) ${invalidCharacters} in the input`)
  }
}

function hasHigherAlphabetIndex (word, anotherWord, indexOfCharacter) {
  return alphabet.indexOf(word[indexOfCharacter]) > alphabet.indexOf(anotherWord[indexOfCharacter])
}

function hasLowerAlphabetIndex (word, anotherWord, indexOfCharacter) {
  return alphabet.indexOf(word[indexOfCharacter]) < alphabet.indexOf(anotherWord[indexOfCharacter])
}

export default function compareStrings (word, anotherWord) {
  isString(word, anotherWord)
  let replacedWord = replaceIgnoredCharacters(word)
  let anotherWordReplaced = replaceIgnoredCharacters(anotherWord)
  checkForInvalidCharacters(replacedWord, anotherWordReplaced)

  for (let indexOfCharacter = 0; indexOfCharacter < replacedWord.length; indexOfCharacter++) {
    if (hasHigherAlphabetIndex(replacedWord, anotherWordReplaced, indexOfCharacter)) {
      return 1
    } else if (hasLowerAlphabetIndex(replacedWord, anotherWordReplaced, indexOfCharacter)) {
      return -1
    }
  }
  return Math.sign(replacedWord.length - anotherWordReplaced.length)
}
