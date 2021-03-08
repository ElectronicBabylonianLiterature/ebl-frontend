import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Reference from 'bibliography/domain/Reference'
import {
  createLine,
  createManuscriptLine,
  createVariant,
} from 'corpus/domain/line'
import { periodModifiers, periods } from 'corpus/domain/period'
import { provenances } from 'corpus/domain/provenance'
import {
  createChapter,
  createManuscript,
  createText,
  types,
} from 'corpus/domain/text'
import { Token } from 'transliteration/domain/token'

const reconstructionTokens: Token[] = [
  {
    value: '%n',
    cleanValue: '%n',
    enclosureType: [],
    erasure: 'NONE',
    language: 'AKKADIAN',
    normalized: true,
    type: 'LanguageShift',
  },
  {
    value: 'kur-kur',
    cleanValue: 'kur-kur',
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
        value: 'kur-kur',
        cleanValue: 'kur-kur',
        enclosureType: [],
        erasure: 'NONE',
        type: 'ValueToken',
      },
    ],
    modifiers: [],
    type: 'AkkadianWord',
  },
]

const atfTokens: Token[] = [
  {
    type: 'Word',
    value: 'kur',
    parts: [],
    cleanValue: 'kur',
    uniqueLemma: [],
    normalized: false,
    language: 'AKKADIAN',
    lemmatizable: true,
    alignable: true,
    erasure: 'NONE',
    alignment: null,
    variant: null,
    enclosureType: [],
  },
  {
    type: 'Word',
    value: 'ra',
    parts: [],
    cleanValue: 'ra',
    uniqueLemma: ['aklu I'],
    normalized: false,
    language: 'AKKADIAN',
    lemmatizable: true,
    alignable: true,
    erasure: 'NONE',
    alignment: 1,
    variant: {
      type: 'Word',
      value: 'ra',
      parts: [],
      cleanValue: 'ra',
      uniqueLemma: ['aklu I'],
      normalized: false,
      language: 'AKKADIAN',
      lemmatizable: true,
      alignable: true,
      erasure: 'NONE',
      alignment: null,
      variant: null,
      enclosureType: [],
    },
    enclosureType: [],
  },
  {
    value: '...',
    cleanValue: '...',
    enclosureType: [],
    erasure: 'NONE',
    type: 'UnknownNumberOfSigns',
  },
]

export const textDto = {
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  numberOfVerses: 10,
  approximateVerses: true,
  chapters: [
    {
      classification: 'Ancient',
      stage: 'Old Babylonian',
      version: 'A',
      name: 'The Only Chapter',
      order: 1,
      manuscripts: [
        {
          id: 1,
          siglumDisambiguator: '1',
          museumNumber: 'BM.X',
          accession: 'X.1',
          periodModifier: 'Early',
          period: 'Ur III',
          provenance: 'Nippur',
          type: 'School',
          notes: 'a note',
          colophon: '1. kur',
          references: [
            {
              id: 'RN1853',
              linesCited: [],
              notes: '',
              pages: '34-54',
              type: 'DISCUSSION',
              document: { id: 'RN1853' },
            },
          ],
        },
      ],
      uncertainFragments: ['K.1'],
      lines: [
        {
          number: '1',
          isBeginningOfSection: true,
          isSecondLineOfParallelism: true,
          variants: [
            {
              reconstruction: '%n kur-kur',
              reconstructionTokens: reconstructionTokens,
              manuscripts: [
                {
                  manuscriptId: 1,
                  labels: ['o', 'iii'],
                  number: 'a+1',
                  atf: 'kur ra',
                  omittedWords: [],
                  atfTokens: atfTokens,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export const text = createText({
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  numberOfVerses: 10,
  approximateVerses: true,
  chapters: [
    createChapter({
      classification: 'Ancient',
      stage: 'Old Babylonian',
      version: 'A',
      name: 'The Only Chapter',
      order: 1,
      uncertainFragments: ['K.1'],
      manuscripts: [
        createManuscript({
          id: 1,
          siglumDisambiguator: '1',
          museumNumber: 'BM.X',
          accession: 'X.1',
          periodModifier: periodModifiers.get('Early'),
          period: periods.get('Ur III'),
          provenance: provenances.get('Nippur'),
          type: types.get('School'),
          notes: 'a note',
          colophon: '1. kur',
          references: [
            new Reference(
              'DISCUSSION',
              '34-54',
              '',
              [],
              new BibliographyEntry({ id: 'RN1853' })
            ),
          ],
        }),
      ],
      lines: [
        createLine({
          number: '1',
          isBeginningOfSection: true,
          isSecondLineOfParallelism: true,
          variants: [
            createVariant({
              reconstruction: '%n kur-kur',
              reconstructionTokens: reconstructionTokens,
              manuscripts: [
                createManuscriptLine({
                  manuscriptId: 1,
                  labels: ['o', 'iii'],
                  number: 'a+1',
                  atf: 'kur ra',
                  atfTokens: atfTokens,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
})
