import {
  lineAlignment,
  lineAlignmentDto,
  lineLemmatization,
  lineLemmatizationDto,
} from 'corpus/application/edit-lite/annotationFixtures.testSupport'
import { ChapterChange } from 'corpus/application/edit-lite/ChapterEditSource'
import { editChapterId } from 'corpus/application/edit-lite/chapterEditSource.testSupport'
import {
  createChapterEndpointUrl,
  createChapterUpdateUrl,
  toChapterUpdate,
} from 'corpus/application/edit-lite/chapterRequests'
import {
  toDeletedLineDto,
  toNewLineDto,
} from 'corpus/application/edit-lite/lineEdits'
import { LineAlignment } from 'corpus/domain/alignment'
import { createLine, EditStatus, Line } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'

const chapterUrl = '/texts/L/1/2/chapters/Standard%20Babylonian/I'
const line: Line = createLine({ number: '7', status: EditStatus.NEW })
const manuscripts: readonly Manuscript[] = [
  new Manuscript({ id: 1, siglumDisambiguator: '1a' }),
]
const atf = '1. kur\n2. ra'

const changes: readonly [ChapterChange, string, unknown][] = [
  [{ type: 'addLine', line }, 'lines', toNewLineDto(line)],
  [{ type: 'deleteLine', index: 5 }, 'lines', toDeletedLineDto(5)],
  [{ type: 'moveLine', from: 4, to: 1 }, 'lines/move', { from: 4, to: 1 }],
  [{ type: 'importLines', atf }, 'import', { atf }],
  [
    { type: 'saveManuscripts', manuscripts, uncertainFragments: ['K.1'] },
    'manuscripts',
    {
      manuscripts: [
        {
          id: 1,
          siglumDisambiguator: '1a',
          oldSigla: [],
          museumNumber: '',
          accession: '',
          provenance: 'Nineveh',
          periodModifier: 'None',
          period: 'Neo-Assyrian',
          type: 'Library',
          notes: '',
          colophon: '',
          unplacedLines: '',
          references: [],
        },
      ],
      uncertainFragments: ['K.1'],
    },
  ],
  [
    { type: 'saveAlignment', index: 2, alignment: lineAlignment },
    'lines/2/alignment',
    lineAlignmentDto,
  ],
  [
    { type: 'saveLemmatization', index: 0, lemmatization: lineLemmatization },
    'lines/0/lemmatization',
    lineLemmatizationDto,
  ],
  [
    { type: 'lemmatizeInstances', word: 'kur', lemmaIds: ['kur I', 'ra I'] },
    'lemmatization/instances',
    { word: 'kur', uniqueLemma: ['kur I', 'ra I'] },
  ],
]

describe('createChapterEndpointUrl', () => {
  it('appends the endpoint and the parameters in the given order', () => {
    expect(
      createChapterEndpointUrl(editChapterId, 'lines', {
        offset: 20,
        limit: 2,
        revision: 'revision 7/a',
      }),
    ).toBe(`${chapterUrl}/lines?offset=20&limit=2&revision=revision%207%2Fa`)
  })

  it.each([[undefined], ['']])('omits the empty parameter %p', (revision) => {
    expect(
      createChapterEndpointUrl(editChapterId, 'import', {
        offset: 0,
        revision,
      }),
    ).toBe(`${chapterUrl}/import?offset=0`)
  })
})

describe('createChapterUpdateUrl', () => {
  it.each([
    'lines',
    'lines/move',
    'import',
    'manuscripts',
    'lines/12/alignment',
    'lines/0/lemmatization',
  ] as const)(
    'asks the %s endpoint for the outline of the given revision',
    (endpoint) => {
      expect(
        createChapterUpdateUrl(editChapterId, endpoint, 'revision-4'),
      ).toBe(`${chapterUrl}/${endpoint}?view=outline&revision=revision-4`)
    },
  )

  it('omits an unknown revision', () => {
    expect(createChapterUpdateUrl(editChapterId, 'manuscripts')).toBe(
      `${chapterUrl}/manuscripts?view=outline`,
    )
  })
})

describe.each(changes)('the change %j', (change, endpoint, body) => {
  it('goes to its endpoint with its body', () => {
    expect(toChapterUpdate(change)).toEqual({ endpoint, body })
  })

  it('is posted to the outline view of its endpoint with the revision', () => {
    const update = toChapterUpdate(change)

    expect(
      createChapterUpdateUrl(editChapterId, update.endpoint, 'revision-4'),
    ).toBe(`${chapterUrl}/${endpoint}?view=outline&revision=revision-4`)
  })

  it('is posted without a revision when none is known', () => {
    expect(
      createChapterUpdateUrl(editChapterId, toChapterUpdate(change).endpoint),
    ).toBe(`${chapterUrl}/${endpoint}?view=outline`)
  })
})

it('sends the line of an added line under new only', () => {
  expect(toChapterUpdate({ type: 'addLine', line }).body).toEqual({
    new: [
      {
        number: '7',
        variants: [],
        isSecondLineOfParallelism: false,
        isBeginningOfSection: false,
        translation: '',
      },
    ],
    deleted: [],
    edited: [],
  })
})

it('sends the index of a deleted line under deleted only', () => {
  expect(toChapterUpdate({ type: 'deleteLine', index: 5 }).body).toEqual({
    new: [],
    deleted: [5],
    edited: [],
  })
})

it.each([
  [0, 2],
  [3, 0],
])('sends a move from %i to %i as the two positions only', (from, to) => {
  const update = toChapterUpdate({ type: 'moveLine', from, to })

  expect(update).toEqual({ endpoint: 'lines/move', body: { from, to } })
  expect(createChapterUpdateUrl(editChapterId, update.endpoint, 'r7')).toBe(
    `${chapterUrl}/lines/move?view=outline&revision=r7`,
  )
})

it('sends a suggested alignment that was not accepted as no alignment', () => {
  const suggestedAlignment: LineAlignment = [
    [
      {
        alignment: [
          {
            value: 'kur',
            alignment: 1,
            variant: null,
            isAlignable: true,
            suggested: true,
          },
        ],
        omittedWords: [],
      },
    ],
  ]

  expect(
    toChapterUpdate({
      type: 'saveAlignment',
      index: 0,
      alignment: suggestedAlignment,
    }).body,
  ).toEqual({
    alignment: [
      [
        {
          alignment: [
            {
              value: 'kur',
              alignment: null,
              variant: '',
              type: '',
              language: '',
            },
          ],
          omittedWords: [],
        },
      ],
    ],
  })
})
