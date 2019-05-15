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

function areFinalCharacters (word, anotherWord, indexOfCharacter) {
  return indexOfCharacter === (word.length - 1) && indexOfCharacter === (anotherWord.length - 1)
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
    } else if (areFinalCharacters(replacedWord, anotherWordReplaced, indexOfCharacter)) {
      return 0
    }
  }
  if (replacedWord.length > anotherWordReplaced.length) {
    return 1
  } else if (replacedWord.length < anotherWordReplaced.length) {
    return -1
  } else {
    return 0
  }
}
