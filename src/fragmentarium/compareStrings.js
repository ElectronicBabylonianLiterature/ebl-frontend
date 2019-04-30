import _ from 'lodash'
import alphabet from './alphabet'

function throwNotAStringError () {
  throw new Error('The input is not a string')
}

function isString (word, anotherWord) {
  return (_.isString(word) && _.isString(anotherWord)) ? true : throwNotAStringError()
}

function splitWord (word, anotherWord, wordToSplit) {
  if (isString(word, anotherWord)) {
    return wordToSplit.split('')
  }
}

function isInTheAlphabet (character) {
  return alphabet.indexOf(character) !== -1
}

function checkForInvalidCharacters (wordAsArray, anotherWordAsArray) {
  if (!wordAsArray.every(isInTheAlphabet) || !anotherWordAsArray.every(isInTheAlphabet)) {
    throw new Error('Invalid character(s) in the input')
  }
}

function hasHigherAlphabetIndex (wordAsArray, anotherWordAsArray, indexOfCharacter) {
  return alphabet.indexOf(wordAsArray[indexOfCharacter]) > alphabet.indexOf(anotherWordAsArray[indexOfCharacter])
}

function hasLowerAlphabetIndex (wordAsArray, anotherWordAsArray, indexOfCharacter) {
  return alphabet.indexOf(wordAsArray[indexOfCharacter]) < alphabet.indexOf(anotherWordAsArray[indexOfCharacter])
}

function areFinalCharacters (wordAsArray, anotherWordAsArray, indexOfCharacter) {
  return indexOfCharacter === (wordAsArray.length - 1) && indexOfCharacter === (anotherWordAsArray.length - 1)
}

function haveEqualAlphabetIndices (wordAsArray, anotherWordAsArray, indexOfCharacter) {
  return alphabet.indexOf(wordAsArray[indexOfCharacter]) === alphabet.indexOf(anotherWordAsArray[indexOfCharacter])
}

function areFinalCharactersAndHaveEqualAlphabetIndices (wordAsArray, anotherWordAsArray, indexOfCharacter) {
  return areFinalCharacters(wordAsArray, anotherWordAsArray, indexOfCharacter) && haveEqualAlphabetIndices(wordAsArray, anotherWordAsArray, indexOfCharacter)
}

function areEmptyArrays (wordAsArray, anotherWordAsArray) {
  return wordAsArray.length === 0 && anotherWordAsArray.length === 0
}

export default function compareStrings (word, anotherWord) {
  let wordAsArray = splitWord(word, anotherWord, word)

  let anotherWordAsArray = splitWord(word, anotherWord, anotherWord)

  checkForInvalidCharacters(wordAsArray, anotherWordAsArray)

  for (let indexOfCharacter = 0; indexOfCharacter <= wordAsArray.length; indexOfCharacter++) {
    if (hasHigherAlphabetIndex(wordAsArray, anotherWordAsArray, indexOfCharacter)) {
      return 1
    } else if (hasLowerAlphabetIndex(wordAsArray, anotherWordAsArray, indexOfCharacter)) {
      return -1
    } else if (areFinalCharactersAndHaveEqualAlphabetIndices(wordAsArray, anotherWordAsArray, indexOfCharacter) || areEmptyArrays(wordAsArray, anotherWordAsArray)) {
      return 0
    }
  }
}
