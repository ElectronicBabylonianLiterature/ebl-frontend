import Promise from 'bluebird'
import { testDelegation } from 'test-helpers/utils'
import BibliographyEntry from 'bibliography/BibliographyEntry'
import Reference from 'bibliography/Reference'
import {
  createText,
  createChapter,
  createManuscript,
  createLine,
  createManuscriptLine,
  types
} from './text'
import TextService from './TextService'
import { periodModifiers, periods } from './period'
import { provenances } from './provenance'

const apiClient = {
  fetchJson: jest.fn(),
  postJson: jest.fn()
}
const testService = new TextService(apiClient)

const textDto = {
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
              document: { id: 'RN1853' }
            }
          ]
        }
      ],
      lines: [
        {
          number: '1',
          reconstruction: 'reconstructed text',
          reconstructionTokens: [
            {
              type: 'AkkadianWord',
              value: 'reconstructed'
            },
            {
              type: 'AkkadianWord',
              value: 'text'
            }
          ],
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
                  uniqueLemma: [],
                  normalized: false,
                  language: 'AKKADIAN',
                  lemmatizable: true,
                  erasure: 'NONE'
                },
                {
                  type: 'Word',
                  value: 'ra',
                  uniqueLemma: [],
                  normalized: false,
                  language: 'AKKADIAN',
                  lemmatizable: true,
                  erasure: 'NONE',
                  alignment: 1
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

const textUpdateDto = {
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
              type: 'DISCUSSION'
            }
          ]
        }
      ],
      lines: [
        {
          number: '1',
          reconstruction: 'reconstructed text',
          manuscripts: [
            {
              manuscriptId: 1,
              labels: ['o', 'iii'],
              number: 'a+1',
              atf: 'kur ra'
            }
          ]
        }
      ]
    }
  ]
}

const text = createText({
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
            )
          ]
        })
      ],
      lines: [
        createLine({
          number: '1',
          reconstruction: 'reconstructed text',
          reconstructionTokens: [
            {
              type: 'AkkadianWord',
              value: 'reconstructed'
            },
            {
              type: 'AkkadianWord',
              value: 'text'
            }
          ],
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
                  uniqueLemma: [],
                  normalized: false,
                  language: 'AKKADIAN',
                  lemmatizable: true,
                  erasure: 'NONE'
                },
                {
                  type: 'Word',
                  value: 'ra',
                  uniqueLemma: [],
                  normalized: false,
                  language: 'AKKADIAN',
                  lemmatizable: true,
                  erasure: 'NONE',
                  alignment: 1
                }
              ]
            })
          ]
        })
      ]
    })
  ]
})

const alignmentDto = {
  alignment: [
    [
      [
        {
          value: 'kur'
        },
        {
          value: 'ra',
          alignment: 1
        }
      ]
    ]
  ]
}

const manuscriptsDto = {
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
          type: 'DISCUSSION'
        }
      ]
    }
  ]
}

const linesDto = {
  lines: [
    {
      number: '1',
      reconstruction: 'reconstructed text',
      manuscripts: [
        {
          manuscriptId: 1,
          labels: ['o', 'iii'],
          number: 'a+1',
          atf: 'kur ra'
        }
      ]
    }
  ]
}

const textsDto = [
  {
    category: 1,
    index: 1,
    name: 'Palm and Vine',
    numberOfVerses: 10,
    approximateVerses: true,
    chapters: []
  }
]

const texts = [
  createText({
    category: 1,
    index: 1,
    name: 'Palm and Vine',
    numberOfVerses: 10,
    approximateVerses: true,
    chapters: []
  })
]

const testData = [
  [
    'find',
    [text.category, text.index],
    apiClient.fetchJson,
    text,
    [
      `/texts/${encodeURIComponent(text.category)}/${encodeURIComponent(
        text.index
      )}`,
      true
    ],
    Promise.resolve(textDto)
  ],
  [
    'list',
    [],
    apiClient.fetchJson,
    texts,
    ['/texts', false],
    Promise.resolve(textsDto)
  ],
  [
    'updateAlignment',
    [text.category, text.index, 0, text.chapters[0].lines],
    apiClient.postJson,
    text,
    [
      `/texts/${encodeURIComponent(text.category)}/${encodeURIComponent(
        text.index
      )}/chapters/0/alignment`,
      alignmentDto
    ],
    Promise.resolve(textDto)
  ],
  [
    'updateManuscripts',
    [text.category, text.index, 0, text.chapters[0].manuscripts],
    apiClient.postJson,
    text,
    [
      `/texts/${encodeURIComponent(text.category)}/${encodeURIComponent(
        text.index
      )}/chapters/0/manuscripts`,
      manuscriptsDto
    ],
    Promise.resolve(textDto)
  ],
  [
    'updateLines',
    [text.category, text.index, 0, text.chapters[0].lines],
    apiClient.postJson,
    text,
    [
      `/texts/${encodeURIComponent(text.category)}/${encodeURIComponent(
        text.index
      )}/chapters/0/lines`,
      linesDto
    ],
    Promise.resolve(textDto)
  ]
]

describe('TextService', () => testDelegation(testService, testData))
