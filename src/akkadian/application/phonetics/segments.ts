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
}

export function transcriptionToPhoneticSegments(
  transcription: string,
  ipaOptions?: IpaOptions
): Segment {
  const syllables = getSyllables(transcription, ipaOptions)
  return {
    transcription: transcription,
    syllables: syllables,
    ipa: syllables.map((syllable) => syllable.ipa).join('.'),
    stress: syllables.findIndex((syllable) => syllable.isStressed),
  }
}
