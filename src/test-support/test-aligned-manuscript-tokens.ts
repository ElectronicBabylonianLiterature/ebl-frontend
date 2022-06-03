import { ManuscriptLineDisplay } from 'corpus/domain/line-details'
import { ManuscriptTypes } from 'corpus/domain/manuscript'
import { PeriodModifiers, Periods } from 'corpus/domain/period'
import { Provenances } from 'corpus/domain/provenance'
import { TextLine, TextLineDto } from 'transliteration/domain/text-line'

export const alignedLine: TextLineDto = {
  type: 'TextLine',
  lineNumber: {
    type: 'LineNumber',
    number: 10,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
  },
  prefix: '10.',
  content: [
    {
      value: 'DINGIR-MEŠ',
      cleanValue: 'DINGIR-MEŠ',
      enclosureType: [],
      erasure: 'NONE',
      parts: [],
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      alignable: true,
      uniqueLemma: ['ilu I'],
      alignment: 1,
      variant: null,
      hasVariantAlignment: false,
      type: 'Word',
    },
  ],
}

export const alignedLineWithVariants: TextLineDto = {
  type: 'TextLine',
  lineNumber: {
    type: 'LineNumber',
    number: 10,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
  },
  prefix: '10.',
  content: [
    {
      value: 'uš-ha-qa',
      cleanValue: 'uš-ha-qa',
      enclosureType: [],
      erasure: 'NONE',
      parts: [],
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      alignable: true,
      uniqueLemma: ['hiāqu I'],
      alignment: 2,
      variant: null,
      hasVariantAlignment: false,
      type: 'Word',
    },
    {
      value: 'u₂-šah-maṭ',
      cleanValue: 'u₂-šah-maṭ',
      enclosureType: [],
      erasure: 'NONE',
      parts: [],
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      alignable: true,
      uniqueLemma: ['hamāṭu I'],
      alignment: 2,
      variant: {
        value: 'ušahmaṭ',
        cleanValue: 'ušahmaṭ',
        enclosureType: [],
        erasure: 'NONE',
        parts: [],
        language: 'AKKADIAN',
        normalized: true,
        lemmatizable: true,
        alignable: true,
        uniqueLemma: [],
        alignment: null,
        variant: null,
        hasVariantAlignment: false,
        modifiers: [],
        type: 'AkkadianWord',
      },
      hasVariantAlignment: false,
      type: 'Word',
    },
  ],
}

export const alignedManuscript = new ManuscriptLineDisplay(
  Provenances.Cutha,
  PeriodModifiers['Late'],
  Periods['Persian'],
  ManuscriptTypes.Library,
  '1',
  [],
  [],
  new TextLine(alignedLine),
  [],
  [],
  [],
  'BM.X',
  false,
  'X.1'
)

export const alignedManuscriptWithVariants = new ManuscriptLineDisplay(
  Provenances.Babylon,
  PeriodModifiers['Early'],
  Periods['Middle Babylonian'],
  ManuscriptTypes.Library,
  '2',
  [],
  [],
  new TextLine(alignedLineWithVariants),
  [],
  [],
  [],
  'IM.1',
  false,
  'X.2'
)
