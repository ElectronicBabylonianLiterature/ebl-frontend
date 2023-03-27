import {
  Syllable,
  getSyllables,
} from 'akkadian/application/phonetics/syllables'
import { IpaOptions } from 'akkadian/application/phonetics/ipa'

interface Segment {
  readonly transcription: string
  readonly ipa: string
  readonly syllables: Syllable[]
  readonly stress: number
  readonly meter: string
}

export default function transcriptionToPhoneticSegment(
  transcription: string,
  ipaOptions?: IpaOptions
): Segment {
  const syllables = getSyllables(transcription, ipaOptions)
  const stress = syllables.findIndex((syllable) => syllable.isStressed)
  return {
    transcription: transcription,
    syllables: syllables,
    ipa: syllables.map((syllable) => syllable.ipa).join('.'),
    stress: stress,
    meter: syllables.map((syllable) => syllable.meter).join(''),
  }
}
