import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Reference from 'bibliography/domain/Reference'
import {
  createText,
  createChapter,
  createManuscript,
  createLine,
  createManuscriptLine,
  types,
} from 'corpus/domain/text'
import { periodModifiers, periods } from 'corpus/domain/period'
import { provenances } from 'corpus/domain/provenance'

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
      lines: [
        {
          number: '1',
          reconstruction: 'reconstructed text',
          reconstructionTokens: [
            {
              value: 'kur',
              cleanValue: 'kur',
              enclosureType: [],
              erasure: 'NONE',
              lemmatizable: true,
              alignment: null,
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
            },
            {
              value: 'ra',
              cleanValue: 'ra',
              enclosureType: [],
              erasure: 'NONE',
              lemmatizable: true,
              alignment: null,
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
            },
          ],
          isBeginningOfSection: true,
          isSecondLineOfParallelism: true,
          manuscripts: [
            {
              manuscriptId: 1,
              labels: ['o', 'iii'],
              number: 'a+1',
              atf: 'kur ra',
              atfTokens: [
                {
                  type: 'Word',
                  value: 'kur',
                  parts: [],
                  cleanValue: 'kur',
                  uniqueLemma: [],
                  normalized: false,
                  language: 'AKKADIAN',
                  lemmatizable: true,
                  erasure: 'NONE',
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
                  erasure: 'NONE',
                  alignment: 1,
                  enclosureType: [],
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
          reconstruction: 'reconstructed text',
          reconstructionTokens: [
            {
              value: 'kur',
              cleanValue: 'kur',
              enclosureType: [],
              erasure: 'NONE',
              lemmatizable: true,
              alignment: null,
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
            },
            {
              value: 'ra',
              cleanValue: 'ra',
              enclosureType: [],
              erasure: 'NONE',
              lemmatizable: true,
              alignment: null,
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
            },
          ],
          isBeginningOfSection: true,
          isSecondLineOfParallelism: true,
          manuscripts: [
            createManuscriptLine({
              manuscriptId: 1,
              labels: ['o', 'iii'],
              number: 'a+1',
              atf: 'kur ra',
              atfTokens: [
                {
                  type: 'Word',
                  value: 'kur',
                  parts: [],
                  cleanValue: 'kur',
                  uniqueLemma: [],
                  normalized: false,
                  language: 'AKKADIAN',
                  lemmatizable: true,
                  erasure: 'NONE',
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
                  erasure: 'NONE',
                  alignment: 1,
                  enclosureType: [],
                },
              ],
            }),
          ],
        }),
      ],
    }),
  ],
})
