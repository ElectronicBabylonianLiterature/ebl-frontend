import {
  Syllable,
  getSyllables,
} from 'akkadian/application/phonetics/syllables'
import { IpaProps } from 'akkadian/application/phonetics/ipa'
import { MeterProps } from 'akkadian/application/phonetics/meter'
import { FormOverride } from 'akkadian/application/lexics/formOverrides'

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
  ipaProps?: IpaProps
  meterProps?: MeterProps
  wordContext?: WordContext
  formOverride?: FormOverride
}

export type Segments = Segment[]

export function getPhoneticSegments(
  transcription: string,
  phoneticProps?: PhoneticProps,
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

export function tokenToPhoneticSegments(
  token: Token,
  phoneticProps?: PhoneticProps,
): Segment[] {
  if (token.uniqueLemma) {
    const formOverride = getFormOverrideAndTransform(
      token.cleanValue,
      token.uniqueLemma[0],
      phoneticProps,
    )
    return transcriptionsToPhoneticSegments(
      [formOverride?.overrideForm ?? token.cleanValue],
      {
        ...phoneticProps,
        formOverride,
      },
    )
  }
  return transcriptionsToPhoneticSegments([token.cleanValue], phoneticProps)
}

export default function transcriptionsToPhoneticSegments(
  transcriptions: readonly string[],
  phoneticProps?: PhoneticProps,
): Segment[] {
  return _.flattenDeep(
    transcriptions.map((element) =>
      element.replace('-ma', 'ma').split(/[-| ]/g),
    ),
  ).map((transcription) =>
    getPhoneticSegments(transcription.toLowerCase(), phoneticProps),
  )
}
