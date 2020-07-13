import { NoteLine } from 'transliteration/domain/note-line'
import Reference from 'bibliography/domain/Reference'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

export const note: NoteLine = new NoteLine({
  prefix: '#note: ',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: 'this is a note ',
      value: 'this is a note ',
      type: 'ValueToken',
    },
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: '@i{italic text}',
      value: '@i{italic text}',
      type: 'ValueToken',
    },
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: ' ',
      value: ' ',
      type: 'ValueToken',
    },
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: '@akk{kur}',
      value: '@akk{kur}',
      type: 'ValueToken',
    },
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: ' ',
      value: ' ',
      type: 'ValueToken',
    },
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: '@sux{kur}',
      value: '@sux{kur}',
      type: 'ValueToken',
    },
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: '@bib{RN1@5}',
      value: '@bib{RN1@5}',
      type: 'ValueToken',
    },
  ],
  parts: [
    {
      text: 'this is a note ',
      type: 'StringPart',
    },
    {
      text: 'italic text',
      type: 'EmphasisPart',
    },
    {
      text: ' ',
      type: 'StringPart',
    },
    {
      language: 'AKKADIAN',
      tokens: [
        {
          enclosureType: [],
          erasure: 'NONE',
          cleanValue: 'kur',
          value: 'kur',
          language: 'AKKADIAN',
          normalized: false,
          lemmatizable: true,
          uniqueLemma: [],
          parts: [
            {
              enclosureType: [],
              erasure: 'NONE',
              cleanValue: 'kur',
              value: 'kur',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: [],
                  erasure: 'NONE',
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
          type: 'Word',
        },
      ],
      type: 'LanguagePart',
    },
    {
      text: ' ',
      type: 'StringPart',
    },
    {
      language: 'SUMERIAN',
      tokens: [
        {
          enclosureType: [],
          erasure: 'NONE',
          cleanValue: 'kur',
          value: 'kur',
          language: 'SUMERIAN',
          normalized: false,
          lemmatizable: false,
          uniqueLemma: [],
          parts: [
            {
              enclosureType: [],
              erasure: 'NONE',
              cleanValue: 'kur',
              value: 'kur',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: [],
                  erasure: 'NONE',
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
          type: 'Word',
        },
      ],
      type: 'LanguagePart',
    },
    {
      reference: {
        id: 'RN1',
        type: 'DISCUSSION',
        pages: '5',
        notes: '',
        linesCited: [],
      },
      type: 'BibliographyPart',
    },
  ],
  type: 'NoteLine',
})

export const hydratedNote: NoteLine = new NoteLine({
  prefix: '#note: ',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: '@bib{RN1@5}',
      value: '@bib{RN1@5}',
      type: 'ValueToken',
    },
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: '@bib{RN2@3}',
      value: '@bib{RN3@3}',
      type: 'ValueToken',
    },
  ],
  parts: [
    {
      reference: {
        id: 'RN1',
        type: 'DISCUSSION',
        pages: '5',
        notes: '',
        linesCited: [],
      },
      type: 'BibliographyPart',
    },
    {
      reference: new Reference(
        'DISCUSSION',
        '3',
        '',
        [],
        new BibliographyEntry({
          id: 'RN2',
          title: 'Title',
          type: 'article-journal',
          issued: {
            'date-parts': [[2020, 5, 18]],
          },
          volume: '12',
          page: '1-9',
          issue: 7,
          'container-title': 'Container',
          author: [{ given: 'Alice', family: 'Bob' }],
          URL: 'http://example.com',
        })
      ),
      type: 'BibliographyPart',
    },
  ],
  type: 'NoteLine',
})

export default note
