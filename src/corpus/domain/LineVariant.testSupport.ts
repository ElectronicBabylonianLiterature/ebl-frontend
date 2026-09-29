import {
  Enclosure,
  EnclosureType,
  Joiner,
  NamedSign,
  ValueToken,
  Word,
} from 'transliteration/domain/token'
import { atfToken } from 'test-support/test-tokens'

export function valuePart(
  cleanValue: string,
  value: string = cleanValue,
): ValueToken {
  return {
    enclosureType: [],
    cleanValue,
    value,
    type: 'ValueToken',
  }
}

export function readingPart(
  name: string,
  value: string = name,
  flags: readonly string[] = [],
  nameParts: readonly (ValueToken | Enclosure)[] = [valuePart(name)],
): NamedSign {
  return {
    enclosureType: [],
    cleanValue: name,
    value,
    name,
    nameParts,
    subIndex: 1,
    modifiers: [],
    flags,
    sign: null,
    type: 'Reading',
  }
}

export function joinerPart(
  value: string,
  enclosureType: readonly EnclosureType[] = [],
): Joiner {
  return {
    value,
    cleanValue: value,
    enclosureType,
    erasure: 'NONE',
    type: 'Joiner',
  }
}

const leftBrokenAway: Enclosure = {
  value: '[',
  cleanValue: '',
  enclosureType: [],
  erasure: 'NONE',
  side: 'LEFT',
  type: 'BrokenAway',
}

export const brokenKurRaPaWord: Word = {
  ...atfToken,
  value: 'ku[r-ra-pa',
  parts: [
    readingPart(
      'kur',
      'k[ur',
      [],
      [valuePart('ku', 'kur'), leftBrokenAway, valuePart('r')],
    ),
    joinerPart('-', ['BROKEN_AWAY']),
    readingPart('ra'),
    joinerPart('-', ['BROKEN_AWAY']),
    readingPart('pa'),
  ],
  cleanValue: 'kur-ra-pa',
}

export const uncertainKurRaPaWord: Word = {
  ...atfToken,
  value: 'kur-ra?-pa',
  parts: [
    readingPart('kur'),
    joinerPart('-'),
    readingPart('ra', 'ra?', ['UNCERTAIN']),
    joinerPart('-'),
    readingPart('pa'),
  ],
  cleanValue: 'kur-ra-pa',
}

export const kurPlusRaRaWord: Word = {
  ...atfToken,
  value: 'kur+ra-ra',
  parts: [
    readingPart('kur'),
    joinerPart('+'),
    readingPart('ra'),
    joinerPart('-'),
    readingPart('ra'),
  ],
  cleanValue: 'kur+ra-ra',
}
