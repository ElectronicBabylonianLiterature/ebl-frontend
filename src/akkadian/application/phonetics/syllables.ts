import {
  syllablesRegex,
  cvcRegex,
  vcRegex,
  cvRegex,
  vRegex,
  vowelLength1Regex,
  vowelLength2Regex,
} from 'akkadian/domain/transcription/transcription'
import {
  IpaProps,
  transcriptionToIpa,
} from 'akkadian/application/phonetics/ipa'
import {
  syllableToMeter,
  MeterProps,
} from 'akkadian/application/phonetics/meter'
import { PhoneticProps } from './segments'

export interface Syllable {
  readonly transcription: string
  readonly ipa: string
  readonly meter: string
  readonly index: number
  readonly structure: SyllableStructure
  readonly isStressed: boolean
  readonly isClosed: boolean
  readonly vowelLength: number
  readonly weight: Weight
}

export enum Weight {
  LIGHT = 0,
  HEAVY = 1,
  ULTRAHEAVY = 2,
}

export enum SyllableStructure {
  V = 'V',
  CV = 'CV',
  VC = 'VC',
  CVC = 'CVC',
}

export function getSyllables(
  transcription: string,
  phoneticProps?: PhoneticProps,
): Syllable[] {
  let checkIfStressed = phoneticProps?.formOverride?.isStressless !== true
  const syllabized = !phoneticProps?.formOverride?.isMidSyllableSandhi
    ? syllabize(transcription)
    : [transcription]
  return syllabized
    .reverse()
    .map((syllableTranscription, revIndex, array) => {
      const syllable = getSyllable(
        syllableTranscription,
        [array.length - (revIndex + 1), revIndex],
        checkIfStressed,
        phoneticProps,
      )
      if (syllable.isStressed && checkIfStressed) {
        checkIfStressed = false
      }
      return syllable
    })
    .reverse()
}

function getSyllable(
  transcription: string,
  indexes: [number, number],
  checkIfStressed: boolean,
  options?: { ipaProps?: IpaProps; meterProps?: MeterProps },
): Syllable {
  const { structure, isClosed, vowelLength, weight, isStressed } =
    getSyllableData(transcription, indexes, checkIfStressed)
  return {
    transcription: transcription,
    ipa: transcriptionToIpa(transcription, {
      ...(options && options.ipaProps),
      isStressed: isStressed,
    }),
    meter: syllableToMeter(weight, isStressed, options && options.meterProps),
    index: indexes[0],
    isStressed,
    isClosed,
    structure,
    vowelLength,
    weight,
  }
}

function getSyllableData(
  transcription: string,
  indexes: [number, number],
  checkIfStressed: boolean,
): {
  structure: SyllableStructure
  isClosed: boolean
  vowelLength: number
  weight: Weight
  isStressed: boolean
} {
  const [index, revIndex] = indexes
  const structure = getSyllableStructure(transcription)
  const isClosed = checkIfSyllableIsClosed(structure)
  const vowelLength = getVowelLength(transcription)
  const weight = getWeight(isClosed, vowelLength)
  const isStressed =
    checkIfStressed && checkIfSyllableIsStressed(index, revIndex, weight)
  return {
    structure,
    isClosed,
    vowelLength,
    weight,
    isStressed,
  }
}

export function syllabize(transcription: string): string[] {
  const match = transcription.match(syllablesRegex)
  if (match && [...match].join('') === transcription) {
    return match
  }
  throw new Error(
    `Transcription "${transcription}" cannot be syllabized (likely invalid).`,
  )
}

function getSyllableStructure(transcription: string): SyllableStructure {
  const options: {
    regexpString: string
    type: SyllableStructure
  }[] = [
    { regexpString: cvcRegex, type: SyllableStructure.CVC },
    { regexpString: vcRegex, type: SyllableStructure.VC },
    { regexpString: vRegex, type: SyllableStructure.V },
    { regexpString: cvRegex, type: SyllableStructure.CV },
  ]
  for (const { regexpString, type } of options) {
    if (transcription.match(new RegExp(`^${regexpString}$`))) {
      return type
    }
  }
  throw new Error(
    `Unknown type of syllable structure for "${transcription}" (likely invalid).`,
  )
}

function getWeight(isClosed: boolean, vowelLength: number): Weight {
  return vowelLength === 2
    ? Weight.ULTRAHEAVY
    : isClosed || vowelLength > 0
      ? Weight.HEAVY
      : Weight.LIGHT
}

function checkIfSyllableIsClosed(structure: SyllableStructure): boolean {
  return [SyllableStructure.CVC, SyllableStructure.VC].includes(structure)
}

function getVowelLength(transcription: string): number {
  return transcription.match(vowelLength1Regex)
    ? 1
    : transcription.match(vowelLength2Regex)
      ? 2
      : 0
}

/* Implements Huenergard's definition. */
function checkIfSyllableIsStressed(
  index: number,
  revIndex: number,
  weight: Weight,
): boolean {
  return (
    (revIndex === 0 && weight === Weight.ULTRAHEAVY) ||
    (revIndex > 0 && [Weight.HEAVY, Weight.ULTRAHEAVY].includes(weight)) ||
    index === 0
  )
}
