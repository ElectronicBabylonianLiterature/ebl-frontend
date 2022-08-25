import { AkkadianWord, Shift, Word } from 'transliteration/domain/token'

export const atfToken: Word = {
  type: 'Word',
  value: '',
  parts: [],
  cleanValue: '',
  uniqueLemma: [],
  normalized: false,
  language: 'AKKADIAN',
  lemmatizable: true,
  alignable: true,
  erasure: 'NONE',
  alignment: null,
  variant: null,
  enclosureType: [],
  hasVariantAlignment: false,
  hasOmittedAlignment: false,
}

export const atfTokenRa: Word = {
  ...atfToken,
  value: 'ra',
  parts: [
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
  ],
  cleanValue: 'ra',
}

export const atfTokenKur: Word = {
  ...atfToken,
  value: 'kur',
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
  ],
  cleanValue: 'kur',
}

export const atfTokenEllipsis: Word = {
  ...atfToken,
  value: '...',
  parts: [
    {
      enclosureType: [],
      cleanValue: '...',
      value: '...',
      type: 'UnknownNumberOfSigns',
    },
  ],
  cleanValue: '...',
  lemmatizable: false,
  alignable: false,
}

export const languageShiftToken: Shift = {
  value: '%n',
  cleanValue: '%n',
  enclosureType: [],
  erasure: 'NONE',
  language: 'AKKADIAN',
  normalized: true,
  type: 'LanguageShift',
}

export const raToken: AkkadianWord = {
  value: 'ra',
  cleanValue: 'ra',
  enclosureType: [],
  erasure: 'NONE',
  lemmatizable: true,
  alignable: true,
  alignment: null,
  variant: null,
  uniqueLemma: [],
  normalized: true,
  language: 'AKKADIAN',
  parts: [
    {
      value: 'ra',
      cleanValue: 'ra',
      enclosureType: [],
      erasure: 'NONE',
      type: 'ValueToken',
    },
  ],
  modifiers: [],
  type: 'AkkadianWord',
  hasVariantAlignment: false,
  hasOmittedAlignment: false,
}

export const kurToken: AkkadianWord = {
  value: 'kur',
  cleanValue: 'kur',
  enclosureType: [],
  erasure: 'NONE',
  lemmatizable: true,
  alignable: true,
  alignment: null,
  variant: null,
  uniqueLemma: [],
  normalized: true,
  language: 'AKKADIAN',
  parts: [
    {
      value: 'kur',
      cleanValue: 'kur',
      enclosureType: [],
      erasure: 'NONE',
      type: 'ValueToken',
    },
  ],
  modifiers: [],
  type: 'AkkadianWord',
  hasVariantAlignment: false,
  hasOmittedAlignment: false,
}
