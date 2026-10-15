import { Word } from 'transliteration/domain/token'
import { atfToken } from 'test-support/test-tokens'

export const brokenKurRaPa: Word = {
  ...atfToken,
  value: 'ku[r-ra-pa',
  parts: [
    {
      enclosureType: [],
      cleanValue: 'kur',
      value: 'k[ur',
      name: 'kur',
      nameParts: [
        {
          enclosureType: [],
          cleanValue: 'ku',
          value: 'kur',
          type: 'ValueToken',
        },
        {
          value: '[',
          cleanValue: '',
          enclosureType: [],
          erasure: 'NONE',
          side: 'LEFT',
          type: 'BrokenAway',
        },
        {
          enclosureType: [],
          cleanValue: 'r',
          value: 'r',
          type: 'ValueToken',
        },
      ],
      subIndex: 1,
      modifiers: [],
      flags: [],
      sign: null,
      type: 'Reading',
    },
    {
      value: '-',
      cleanValue: '-',
      enclosureType: ['BROKEN_AWAY'],
      erasure: 'NONE',
      type: 'Joiner',
    },
    {
      enclosureType: [],
      cleanValue: 'ra',
      value: 'ra',
      name: 'ra',
      nameParts: [
        {
          enclosureType: [],
          cleanValue: 'ra',
          value: 'ra',
          type: 'ValueToken',
        },
      ],
      subIndex: 1,
      modifiers: [],
      flags: [],
      sign: null,
      type: 'Reading',
    },
    {
      value: '-',
      cleanValue: '-',
      enclosureType: ['BROKEN_AWAY'],
      erasure: 'NONE',
      type: 'Joiner',
    },
    {
      enclosureType: [],
      cleanValue: 'pa',
      value: 'pa',
      name: 'pa',
      nameParts: [
        {
          enclosureType: [],
          cleanValue: 'pa',
          value: 'pa',
          type: 'ValueToken',
        },
      ],
      subIndex: 1,
      modifiers: [],
      flags: [],
      sign: null,
      type: 'Reading',
    },
  ],
  cleanValue: 'kur-ra-pa',
}

export const uncertainKurRaPa: Word = {
  ...atfToken,
  value: 'kur-ra?-pa',
  parts: [
    {
      enclosureType: [],
      cleanValue: 'kur',
      value: 'kur',
      name: 'kur',
      nameParts: [
        {
          enclosureType: [],
          cleanValue: 'kur',
          value: 'kur',
          type: 'ValueToken',
        },
      ],
      subIndex: 1,
      modifiers: [],
      flags: [],
      sign: null,
      type: 'Reading',
    },
    {
      value: '-',
      cleanValue: '-',
      enclosureType: [],
      erasure: 'NONE',
      type: 'Joiner',
    },
    {
      enclosureType: [],
      cleanValue: 'ra',
      value: 'ra?',
      name: 'ra',
      nameParts: [
        {
          enclosureType: [],
          cleanValue: 'ra',
          value: 'ra',
          type: 'ValueToken',
        },
      ],
      subIndex: 1,
      modifiers: [],
      flags: ['UNCERTAIN'],
      sign: null,
      type: 'Reading',
    },
    {
      value: '-',
      cleanValue: '-',
      enclosureType: [],
      erasure: 'NONE',
      type: 'Joiner',
    },
    {
      enclosureType: [],
      cleanValue: 'pa',
      value: 'pa',
      name: 'pa',
      nameParts: [
        {
          enclosureType: [],
          cleanValue: 'pa',
          value: 'pa',
          type: 'ValueToken',
        },
      ],
      subIndex: 1,
      modifiers: [],
      flags: [],
      sign: null,
      type: 'Reading',
    },
  ],
  cleanValue: 'kur-ra-pa',
}
