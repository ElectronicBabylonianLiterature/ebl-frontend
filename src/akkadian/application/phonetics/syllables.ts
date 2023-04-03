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
  IpaOptions,
  transcriptionToIpa,
} from 'akkadian/application/phonetics/ipa'
import {
  syllableToMeter,
  MeterOptions,
} from 'akkadian/application/phonetics/meter'

export interface Syllable {
  readonly transcription: string
  readonly ipa: string
  readonly meter: string
  readonly index: number
  readonly structure: SyllableStructure
  readonly isStressed: boolean
  readonly isClosed: boolean
  readonly vowelLength: number
  readonly weight: SyllableWeight
}

export enum SyllableWeight {
  LIGHT = 0,
  HEAVY = 1,
  SUPERHEAVY = 2,
}

export enum SyllableStructure {
  V = 'V',
  CV = 'CV',
  VC = 'VC',
  CVC = 'CVC',
}

export function getSyllables(
  transcription: string,
  options: { ipaOptions?: IpaOptions; meterOptions?: MeterOptions }
): Syllable[] {
  let isStressFound = false
  return syllabize(transcription)
    .reverse()
    .map((syllableTranscription, revIndex, array) => {
      const syllable = getSyllable(
        syllableTranscription,
        [array.length - (revIndex + 1), revIndex],
        !isStressFound,
        options
      )
      if (syllable.isStressed && !isStressFound) {
        isStressFound = true
      }
      return syllable
    })
    .reverse()
}

function getSyllable(
  transcription: string,
  indexes: [number, number],
  checkifStressed: boolean,
  options: { ipaOptions?: IpaOptions; meterOptions?: MeterOptions }
): Syllable {
  const [index, revIndex] = indexes
  const structure = getSyllableStructure(transcription)
  const isSyllableClosed = checkIfSyllableIsClosed(structure)
  const vowelLength = getVowelLength(transcription)
  const syllableWeight = getSyllableWeight(isSyllableClosed, vowelLength)
  const isSyllableStressed =
    checkifStressed &&
    checkIfSyllableIsStressed(index, revIndex, syllableWeight)
  const ipa = transcriptionToIpa(transcription, {
    ...options.ipaOptions,
    isSyllableStressed: isSyllableStressed,
  })
  const meter = syllableToMeter(
    syllableWeight,
    isSyllableStressed,
    options.meterOptions
  )
  return {
    transcription: transcription,
    ipa: ipa,
    meter: meter,
    index: index,
    isStressed: isSyllableStressed,
    isClosed: isSyllableClosed,
    structure: structure,
    vowelLength: vowelLength,
    weight: syllableWeight,
  }
}

export function syllabize(transcription: string): string[] {
  const match = transcription.match(syllablesRegex)
  if (match && [...match].join('') === transcription) {
    return match
  }
  throw new Error(
    `Transcription "${transcription}" cannot be syllabized (likely invalid).`
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
    `Unknown type of syllable structure for "${transcription}" (likely invalid).`
  )
}

function getSyllableWeight(
  isSyllableClosed: boolean,
  vowelLength: number
): SyllableWeight {
  return isSyllableClosed && vowelLength === 2
    ? SyllableWeight.SUPERHEAVY
    : isSyllableClosed || vowelLength > 0
    ? SyllableWeight.HEAVY
    : SyllableWeight.LIGHT
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
  weight: SyllableWeight
): boolean {
  return (
    (revIndex === 0 && weight === SyllableWeight.SUPERHEAVY) ||
    (revIndex > 0 &&
      [SyllableWeight.HEAVY, SyllableWeight.SUPERHEAVY].includes(weight)) ||
    index === 0
  )
}
