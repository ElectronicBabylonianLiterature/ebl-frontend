import { Enclosure, EnclosureType, Word } from 'transliteration/domain/token'
import {
  enclosure,
  reading,
  valueToken,
  word,
} from 'test-support/complex-text/tokenBuilders'

export interface KurEnclosure {
  readonly type: Enclosure['type']
  readonly open: string
  readonly close: string
  readonly enclosureType: EnclosureType
}

export function enclosedKurReading(
  enclosureType: readonly EnclosureType[],
): ReturnType<typeof reading> {
  return reading('kur', 'kur', {
    enclosureType,
    nameParts: [valueToken('kur', { enclosureType })],
  })
}

export function openedKur(
  { type, open, enclosureType }: KurEnclosure,
  outer: readonly EnclosureType[],
): Word {
  return word(
    `${open}kur`,
    [
      enclosure(type, open, 'LEFT', { enclosureType: outer }),
      enclosedKurReading([...outer, enclosureType]),
    ],
    { enclosureType: outer, cleanValue: 'kur' },
  )
}

export function closedKur(
  { type, close, enclosureType }: KurEnclosure,
  outer: readonly EnclosureType[],
): Word {
  const inner = [...outer, enclosureType]
  return word(
    `kur${close}`,
    [
      enclosedKurReading(inner),
      enclosure(type, close, 'RIGHT', { enclosureType: inner }),
    ],
    { enclosureType: inner, cleanValue: 'kur' },
  )
}

export const accidentalOmission: KurEnclosure = {
  type: 'AccidentalOmission',
  open: '<',
  close: '>',
  enclosureType: 'ACCIDENTAL_OMISSION',
}

export const intentionalOmission: KurEnclosure = {
  type: 'IntentionalOmission',
  open: '<(',
  close: ')>',
  enclosureType: 'INTENTIONAL_OMISSION',
}

export const removal: KurEnclosure = {
  type: 'Removal',
  open: '<<',
  close: '>>',
  enclosureType: 'REMOVAL',
}
