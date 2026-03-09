import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Reference from 'bibliography/domain/Reference'
import {
  createLine,
  createManuscriptLine,
  createVariant,
} from 'corpus/domain/line'
import { PeriodModifiers, Periods } from 'common/period'
import { Provenances } from 'corpus/domain/provenance'
import { createChapter, createText } from 'corpus/domain/text'
import {
  Manuscript,
  ManuscriptTypes,
  OldSiglum,
} from 'corpus/domain/manuscript'
import { Token } from 'transliteration/domain/token'
import { ResearchProjects } from 'research-projects/researchProject'

export const reconstructionTokens: Token[] = [
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
    hasVariantAlignment: false,
    hasOmittedAlignment: false,
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
    hasVariantAlignment: false,
    hasOmittedAlignment: false,
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
      hasVariantAlignment: false,
      hasOmittedAlignment: false,
    },
    enclosureType: [],
    hasVariantAlignment: false,
    hasOmittedAlignment: false,
  },
  {
    value: '...',
    cleanValue: '...',
    enclosureType: [],
    erasure: 'NONE',
    type: 'UnknownNumberOfSigns',
  },
]

export const chapterDto = {
  classification: 'Ancient',
  stage: 'Old Babylonian',
  version: 'A',
  name: 'The Only Chapter',
  order: 1,
  manuscripts: [
    {
      id: 1,
      siglumDisambiguator: '1',
      oldSigla: [
        {
          siglum: 'os-test',
          reference: {
            id: 'RN1853',
            linesCited: [],
            notes: '',
            pages: '34-54',
            type: 'DISCUSSION',
            document: { id: 'RN1853' },
          },
        },
      ],
      museumNumber: 'BM.X',
      accession: 'X.1',
      periodModifier: 'Early',
      period: 'Ur III',
      provenance: 'Nippur',
      type: 'School',
      notes: 'a note',
      colophon: '1. kur',
      unplacedLines: '1. bu',
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
      joins: [],
      isInFragmentarium: false,
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
}

export const textDto = {
  genre: 'L',
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  numberOfVerses: 10,
  approximateVerses: true,
  intro: 'This is a *test text*.',
  chapters: [
    {
      stage: 'Old Babylonian',
      name: 'The Only Chapter',
      title: [],
      uncertainFragments: [
        {
          museumNumber: {
            prefix: 'X',
            number: '1',
            suffix: '',
          },
        },
      ],
    },
  ],
  references: [],
  projects: ['CAIC'],
}

export const chapter = createChapter({
  classification: 'Ancient',
  stage: 'Old Babylonian',
  version: 'A',
  name: 'The Only Chapter',
  order: 1,
  uncertainFragments: ['K.1'],
  manuscripts: [
    new Manuscript(
      1,
      '1',
      [
        new OldSiglum(
          'os-test',
          new Reference(
            'DISCUSSION',
            '34-54',
            '',
            [],
            new BibliographyEntry({ id: 'RN1853' }),
          ),
        ),
      ],
      'BM.X',
      'X.1',
      PeriodModifiers['Early'],
      Periods['Ur III'],
      Provenances.Nippur,
      ManuscriptTypes.School,
      'a note',
      '1. kur',
      '1. bu',
      [
        new Reference(
          'DISCUSSION',
          '34-54',
          '',
          [],
          new BibliographyEntry({ id: 'RN1853' }),
        ),
      ],
      [],
      false,
    ),
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
})

export const text = createText({
  genre: 'L',
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  numberOfVerses: 10,
  approximateVerses: true,
  intro: 'This is a *test text*.',
  chapters: [
    {
      stage: chapter.stage,
      name: chapter.name,
      title: [],
      uncertainFragments: [
        {
          museumNumber: 'X.1',
        },
      ],
    },
  ],
  projects: [ResearchProjects.CAIC],
})
