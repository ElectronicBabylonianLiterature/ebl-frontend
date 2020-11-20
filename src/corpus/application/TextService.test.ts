import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import TextService from './TextService'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'
import Lemma from 'transliteration/domain/Lemma'
import { text, textDto } from 'test-support/test-corpus-text'

const apiClient = {
  fetchJson: jest.fn(),
  postJson: jest.fn(),
}
const testService = new TextService(apiClient)

const alignmentDto = {
  alignment: [
    [
      [
        {
          value: 'kur',
        },
        {
          value: 'ra',
          alignment: 1,
        },
      ],
    ],
  ],
}

const lemmatization = [
  [
    [
      new LemmatizationToken('%n', false, null),
      new LemmatizationToken('ra', true, []),
    ],
    [
      [
        new LemmatizationToken('kur', true, []),
        new LemmatizationToken('ra', true, [
          new Lemma({
            _id: 'aklu I',
            pos: [],
            lemma: ['aklu'],
            homonym: 'I',
            guideWord: '',
            oraccWords: [],
          }),
        ]),
      ],
    ],
  ],
]

const lemmatizationDto = {
  lemmatization: [
    [
      [
        {
          value: '%n',
        },
        {
          value: 'ra',
          uniqueLemma: [],
        },
      ],
      [
        {
          value: 'kur',
          uniqueLemma: [],
        },
        {
          value: 'ra',
          uniqueLemma: ['aklu I'],
        },
      ],
    ],
  ],
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
          type: 'DISCUSSION',
        },
      ],
    },
  ],
}

const linesDto = {
  lines: [
    {
      number: '1',
      reconstruction: 'reconstructed text',
      isBeginningOfSection: true,
      isSecondLineOfParallelism: true,
      manuscripts: [
        {
          manuscriptId: 1,
          labels: ['o', 'iii'],
          number: 'a+1',
          atf: 'kur ra',
        },
      ],
    },
  ],
}

const textsDto = [
  {
    category: 1,
    index: 1,
    name: 'Palm and Vine',
    numberOfVerses: 10,
    approximateVerses: true,
  },
]

const testData: TestData[] = [
  [
    'find',
    [text.category, text.index],
    apiClient.fetchJson,
    text,
    [
      `/texts/${encodeURIComponent(text.category)}/${encodeURIComponent(
        text.index
      )}`,
      true,
    ],
    Promise.resolve(textDto),
  ],
  [
    'list',
    [],
    apiClient.fetchJson,
    textsDto,
    ['/texts', false],
    Promise.resolve(textsDto),
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
      alignmentDto,
    ],
    Promise.resolve(textDto),
  ],
  [
    'updateLemmatization',
    [text.category, text.index, 0, lemmatization],
    apiClient.postJson,
    text,
    [
      `/texts/${encodeURIComponent(text.category)}/${encodeURIComponent(
        text.index
      )}/chapters/0/lemmatization`,
      lemmatizationDto,
    ],
    Promise.resolve(textDto),
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
      manuscriptsDto,
    ],
    Promise.resolve(textDto),
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
      linesDto,
    ],
    Promise.resolve(textDto),
  ],
]

describe('TextService', () => testDelegation(testService, testData))
