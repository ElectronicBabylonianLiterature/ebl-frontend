import _transcriptionData from 'akkadian/domain/transcription/transcription.json'
import _transcriptionToIpaMap from 'akkadian/domain/transcription/transcriptionToIpa.json'

interface TranscriptionData {
  readonly consonats: string[]
  readonly vowels: string[]
  readonly vowelsLength0: string[]
  readonly vowelsLength1: string[]
  readonly vowelsLength2: string[]
}

interface TranscriptionToIpaMap {
  readonly [key: string]: { readonly [key: string]: string }
}

export const transcriptionData: TranscriptionData = _transcriptionData
export const transcriptionToIpaMap: TranscriptionToIpaMap =
  _transcriptionToIpaMap

export const consonantRegex = `[${transcriptionData.consonats.join('')}]`
export const vowelRegex = `[${transcriptionData.vowels.join('')}]`
export const vowelLength1Regex = new RegExp(
  `[${transcriptionData.vowelsLength1.join('')}]`,
)
export const vowelLength2Regex = new RegExp(
  `[${transcriptionData.vowelsLength2.join('')}]`,
)

function _getVowelsRegexByIndex(index: number): string {
  return `[${
    transcriptionData.vowels[index] +
    transcriptionData.vowelsLength1[index] +
    transcriptionData.vowelsLength2[index]
  }]`
}

export const allARegex = _getVowelsRegexByIndex(0)
export const allERegex = _getVowelsRegexByIndex(1)
export const allIRegex = _getVowelsRegexByIndex(2)
export const allURegex = _getVowelsRegexByIndex(3)

export const cvcRegex = `(${
  consonantRegex + vowelRegex + consonantRegex
})(?=${consonantRegex}|$)`
export const vcRegex = `(${vowelRegex + consonantRegex})(?=${consonantRegex}|$)`
export const vRegex = `(${vowelRegex})`
export const cvRegex = `(${consonantRegex + vowelRegex})`

export const syllablesRegex = new RegExp(
  `(${[cvcRegex, vcRegex, vRegex, cvRegex].join('|')})`,
  'g',
)
