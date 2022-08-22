import { wordFactory } from 'test-support/word-fixtures'
import { TextLine, TextLineDto } from 'transliteration/domain/text-line'
import { Word } from 'transliteration/domain/token'
import { alignedManuscriptToken } from './line-group-fixtures'
import { Provenances } from 'corpus/domain/provenance'
import { Periods } from 'corpus/domain/period'
import { ManuscriptTypes } from 'corpus/domain/manuscript'

export const dictionaryWord = wordFactory.homonymNotI().build()
export const word: Word = {
  enclosureType: [],
  cleanValue: '|KUR.KUR|',
  value: '|KUR.KUR|',
  language: 'AKKADIAN',
  normalized: false,
  lemmatizable: true,
  alignable: true,
  uniqueLemma: [dictionaryWord._id],
  erasure: 'NONE',
  alignment: null,
  variant: null,
  parts: [
    {
      enclosureType: [],
      cleanValue: '|KUR.KUR|',
      value: '|KUR.KUR|',
      type: 'CompoundGrapheme',
    },
  ],
  type: 'Word',
  hasVariantAlignment: false,
  hasOmittedAlignment: false,
}

export const variantTokenDto: Word = {
  value: 'u₂-šah-maṭ',
  cleanValue: 'variant-u₂-šah-maṭ',
  enclosureType: [],
  erasure: 'NONE',
  parts: [
    {
      value: 'u₂',
      cleanValue: 'u₂',
      enclosureType: [],
      erasure: 'NONE',
      name: 'u',
      nameParts: [
        {
          value: 'u',
          cleanValue: 'u',
          enclosureType: [],
          erasure: 'NONE',
          type: 'ValueToken',
        },
      ],
      subIndex: 2,
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
      value: 'šah',
      cleanValue: 'šah',
      enclosureType: [],
      erasure: 'NONE',
      name: 'šah',
      nameParts: [
        {
          value: 'šah',
          cleanValue: 'šah',
          enclosureType: [],
          erasure: 'NONE',
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
      value: 'maṭ',
      cleanValue: 'maṭ',
      enclosureType: [],
      erasure: 'NONE',
      name: 'maṭ',
      nameParts: [
        {
          value: 'maṭ',
          cleanValue: 'maṭ',
          enclosureType: [],
          erasure: 'NONE',
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
  language: 'AKKADIAN',
  normalized: false,
  lemmatizable: true,
  alignable: true,
  uniqueLemma: ['hamāṭu I'],
  alignment: 1,
  variant: {
    value: 'ušahmaṭ',
    cleanValue: 'ušahmaṭ',
    enclosureType: [],
    erasure: 'NONE',
    parts: [
      {
        value: 'ušahmaṭ',
        cleanValue: 'ušahmaṭ',
        enclosureType: [],
        erasure: 'NONE',
        type: 'ValueToken',
      },
    ],
    language: 'AKKADIAN',
    normalized: true,
    lemmatizable: true,
    alignable: true,
    uniqueLemma: [],
    alignment: null,
    variant: null,
    hasVariantAlignment: false,
    hasOmittedAlignment: false,
    modifiers: [],
    type: 'AkkadianWord',
  },
  hasVariantAlignment: false,
  hasOmittedAlignment: false,
  type: 'Word',
}

export const alignedManuscriptLineDto: TextLineDto = {
  type: 'TextLine',
  lineNumber: {
    number: 1,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
  },
  prefix: '',
  content: [alignedManuscriptToken],
}

export const manuscriptLineDto = {
  line: new TextLine(alignedManuscriptLineDto),
  provenance: Provenances.Uruk,
  period: Periods.Hellenistic,
  type: ManuscriptTypes.Library,
  siglumDisambiguator: '1',
}
