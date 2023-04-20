import {
  Syllable,
  getSyllables,
} from 'akkadian/application/phonetics/syllables'
import { IpaOptions } from 'akkadian/application/phonetics/ipa'
import { MeterOptions } from 'akkadian/application/phonetics/meter'
import _ from 'lodash'
import { AkkadianWord, Token } from 'transliteration/domain/token'
import { getLemmaOverrideAndTransform } from 'akkadian/application/lexics/formOverrides'
//import { isAkkadianWord, isBreak } from 'transliteration/domain/type-guards'

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
export function tokensToPhoneticSegments(tokens: Token[]): string[] {
  // ToDo: Implement
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

  const segmentTokens = tokens.filter(
    (token) => isAkkadianWord(token) || isBreak(token)
  )
  console.log(segmentTokens)
  return []
}*/

export function tokenToPhoneticSegments(
  token: Token,
  phoneticProps?: PhoneticProps
): Segment[] {
  if (token.uniqueLemma) {
    try {
      const lemmaRule = getLemmaOverrideAndTransform(
        token.cleanValue,
        token.uniqueLemma[0],
        phoneticProps ?? {}
      )
      if (lemmaRule) {
        console.log('!!!', [token.uniqueLemma[0], lemmaRule])
      }
    } catch (error) {
      console.log(error)
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
