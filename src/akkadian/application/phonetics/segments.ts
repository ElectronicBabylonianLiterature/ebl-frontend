import {
  Syllable,
  getSyllables,
} from 'akkadian/application/phonetics/syllables'
import { IpaOptions } from 'akkadian/application/phonetics/ipa'
import { MeterOptions } from 'akkadian/application/phonetics/meter'
import _ from 'lodash'
import { Token } from 'transliteration/domain/token'

interface Segment {
  readonly transcription: string
  readonly ipa: string
  readonly syllables: Syllable[]
  readonly stress: number
  readonly meter: string
}

export function getPhoneticSegments(
  transcription: string,
  options: { ipaOptions?: IpaOptions; meterOptions?: MeterOptions }
): Segment {
  const syllables = getSyllables(transcription, options)
  const stress = syllables.findIndex((syllable) => syllable.isStressed)
  return {
    transcription: transcription,
    syllables: syllables,
    ipa: syllables.map((syllable) => syllable.ipa).join('.'),
    stress: stress,
    meter: syllables.map((syllable) => syllable.meter).join(' '),
  }
}

export function tokensToPhoneticSegments(tokens: Token[]): string[] {
  // ToDo: Implement
  return []
}

export default function transcriptionsToPhoneticSegments(
  transcriptions: readonly string[],
  options: { ipaOptions?: IpaOptions; meterOptions?: MeterOptions }
): Segment[] {
  return _.flattenDeep(
    transcriptions.map((element) => element.split(/[-| ]/g))
  ).map((transcription) =>
    getPhoneticSegments(transcription.toLowerCase(), options)
  )
  // ToDo:
  // Implement sandhi for
  // - Internal compounds with -ma
  // - External compounds with ana/ina
  // - Others?
  //
  // The right way to do that would be using a set of dictionary ids.
  // - Define ids.
  // - Store the mapping in `akkadian/domain`.
  // - Pass lexical and morphological information to segments
  // - Make a class that will contain the data and methods.
}
