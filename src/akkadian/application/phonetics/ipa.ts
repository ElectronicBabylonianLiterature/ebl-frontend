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
  readonly [key: string]: string
}

interface Segment {
  readonly transcription: string
  readonly ipa: string
  readonly syllables: Syllable[]
  readonly stress: number
}

export interface Syllable {
  readonly transcription: string
  readonly ipa: string
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

const transcriptionData: TranscriptionData = _transcriptionData
const transcriptionToIpaMap: TranscriptionToIpaMap = _transcriptionToIpaMap

const consonantRegex = `[${transcriptionData.consonats.join('|')}]`
const vowelRegex = `[${transcriptionData.vowels.join('|')}]`

const cvcRegex = `(${
  consonantRegex + vowelRegex + consonantRegex
})(?=${consonantRegex}|$)`
const vcRegex = `(${vowelRegex + consonantRegex})(?=${consonantRegex}|$)`
const vRegex = `(${vowelRegex})`
const cvRegex = `(${consonantRegex + vowelRegex})`

const vowelLength1Regex = new RegExp(
  `[${transcriptionData.vowelsLength1.join('|')}]`
)
const vowelLength2Regex = new RegExp(
  `[${transcriptionData.vowelsLength2.join('|')}]`
)

const syllablesRegex = new RegExp(
  `(${[cvcRegex, vcRegex, vRegex, cvRegex].join('|')})`,
  'g'
)

export function transcriptionToPhoneticSegments(
  transcription: string
): Segment {
  const syllables = getSyllables(transcription)
  return {
    transcription: transcription,
    syllables: syllables,
    ipa: syllables.map((syllable) => syllable.ipa).join('.'),
    stress: syllables.findIndex((syllable) => syllable.isStressed),
  }
}

export function transcriptionToIpa(
  transcription: string,
  isSyllableStressed: boolean
): string {
  const ipa = Object.entries(transcriptionToIpaMap).reduce(
    (prev, entry) => prev.replace(...entry),
    transcription
  )
  return isSyllableStressed ? ipa.replace(/[a|e|i|u][:]*/g, "$&'") : ipa
}

export function getSyllables(transcription: string): Syllable[] {
  let isStressFound = false
  return syllabize(transcription)
    .reverse()
    .map((syllableTranscription, revIndex, array) => {
      const syllable = getSyllable(
        syllableTranscription,
        array.length - (revIndex + 1),
        revIndex,
        !isStressFound
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
  index: number,
  revIndex: number,
  checkifStressed: boolean
): Syllable {
  const structure = getSyllableStructure(transcription)
  const isSyllableClosed = checkIfSyllableIsClosed(structure)
  const vowelLength = getVowelLength(transcription)
  const syllableWeight = getSyllableWeight(isSyllableClosed, vowelLength)
  const isSyllableStressed = checkifStressed
    ? checkIfSyllableIsStressed(index, revIndex, syllableWeight)
    : false
  const ipa = transcriptionToIpa(transcription, isSyllableStressed)
  return {
    transcription: transcription,
    ipa: ipa,
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
  if (!match || [...match].join('') !== transcription) {
    throw new Error(
      `Transcription "${transcription}" cannot be syllabized (likely invalid).`
    )
  }
  return match
}

export function getSyllableStructure(transcription: string): SyllableStructure {
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

export function getSyllableWeight(
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
    ? true
    : false
}

function getVowelLength(transcription: string): number {
  return transcription.match(vowelLength1Regex)
    ? 1
    : transcription.match(vowelLength2Regex)
    ? 2
    : 0
}

function checkIfSyllableIsStressed(
  index: number,
  revIndex: number,
  weight: SyllableWeight
): boolean {
  /* Implements Huenergard's definition. */
  return (revIndex === 0 && weight === SyllableWeight.SUPERHEAVY) ||
    (revIndex > 0 &&
      [SyllableWeight.HEAVY, SyllableWeight.SUPERHEAVY].includes(weight)) ||
    index === 0
    ? true
    : false
}

/*
ToDo:
- Refactor to different files
- Write tests
- Remove excessive exports
- Implement UI components
- Link to application (corpus, dictionary etc.)
*/

console.log(transcriptionToPhoneticSegments('iprus'))
console.log(transcriptionToPhoneticSegments('iparras'))
console.log(transcriptionToPhoneticSegments('purrusû'))
console.log(transcriptionToPhoneticSegments('purrusûm'))
console.log(transcriptionToPhoneticSegments("purrusā'u"))
console.log(transcriptionToPhoneticSegments('awīlum'))
console.log(transcriptionToPhoneticSegments('amēlu'))
