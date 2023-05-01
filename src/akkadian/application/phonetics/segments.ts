import {
  Syllable,
  getSyllables,
} from 'akkadian/application/phonetics/syllables'
import { IpaOptions } from 'akkadian/application/phonetics/ipa'
import { MeterOptions } from 'akkadian/application/phonetics/meter'
import _ from 'lodash'
import { AkkadianWord, Token } from 'transliteration/domain/token'
import { getFormOverrideAndTransform } from 'akkadian/application/lexics/formOverrides'

export interface Segment {
  readonly transcription: string
  readonly ipa: string
  readonly syllables: Syllable[]
  readonly stress: number
  readonly meter: string
}

interface WordContext {
  previousWord?: AkkadianWord
  nextWord?: AkkadianWord
}

export interface PhoneticProps {
  ipaOptions?: IpaOptions
  meterOptions?: MeterOptions
  wordContext?: WordContext
}

export type Segments = Segment[]

export function getPhoneticSegments(
  transcription: string,
  phoneticProps?: PhoneticProps
): Segment {
  const syllables = getSyllables(transcription, phoneticProps)
  const stress = syllables.findIndex((syllable) => syllable.isStressed)
  return {
    transcription: transcription,
    syllables: syllables,
    ipa: syllables.map((syllable) => syllable.ipa).join('.'),
    stress: stress,
    meter: syllables.map((syllable) => syllable.meter).join(' '),
  }
}

/*
  // ToDo:
  // - implement stressless functionality
  // - implement sandhi for internal compounds with -ma
  // - Overlong - only syllables with circumflex
  // - /ša/ before /a/ as /š/.
*/

export function tokenToPhoneticSegments(
  token: Token,
  phoneticProps?: PhoneticProps
): Segment[] {
  if (token.uniqueLemma) {
    // ToDo:
    // - remove debugging
    try {
      const formOverride = getFormOverrideAndTransform(
        token.cleanValue,
        token.uniqueLemma[0],
        phoneticProps ?? {}
      )
      if (formOverride) {
        console.log('!!!', [token.uniqueLemma[0], formOverride])
        return transcriptionsToPhoneticSegments(
          [formOverride?.transformedForm ?? formOverride.overrideForm],
          phoneticProps
        )
      }
    } catch (error) {
      //console.log(error)
    }
  }
  return transcriptionsToPhoneticSegments([token.cleanValue], phoneticProps)
}

export default function transcriptionsToPhoneticSegments(
  transcriptions: readonly string[],
  phoneticProps?: PhoneticProps
): Segment[] {
  return _.flattenDeep(
    transcriptions.map((element) => element.split(/[-| ]/g))
  ).map((transcription) =>
    getPhoneticSegments(transcription.toLowerCase(), phoneticProps)
  )
}
