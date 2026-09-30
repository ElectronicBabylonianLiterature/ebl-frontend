import Bluebird from 'bluebird'
import TextService from 'corpus/application/TextService'
import { LineDetails, ManuscriptLineDisplay } from 'corpus/domain/line-details'
import { ManuscriptTypes, OldSiglum } from 'corpus/domain/manuscript'
import { Provenances } from 'corpus/domain/provenance'
import { PeriodModifiers, Periods } from 'common/utils/period'
import { TextLine } from 'transliteration/domain/text-line'
import { NoteLine } from 'transliteration/domain/note-line'
import createReference from 'bibliography/application/createReference'
import { TestData, testDelegation } from 'test-support/utils'
import { lines } from 'test-support/test-fragment'
import {
  bibliographyEntryFactory,
  cslDataFactory,
  referenceDtoFactory,
} from 'test-support/bibliography-fixtures'
import { lineVariantDisplayFactory } from 'test-support/dictionary-line-fixtures'
import { singleRulingDto } from 'test-support/lines/dollar'
import {
  apiClient,
  bibliographyServiceMock,
  chapterId,
  chapterUrl,
  setupProvenances,
  testService,
} from 'corpus/application/textService.testSupport'

const cslData = cslDataFactory.build()
const oldSiglumReferenceDto = referenceDtoFactory.build(
  {},
  { associations: { document: cslData } },
)

const testData: TestData<TextService>[] = [
  new TestData(
    'findChapterLine',
    [chapterId, 0, 0],
    apiClient.fetchJson,
    new LineDetails(
      [
        lineVariantDisplayFactory.build({
          reconstruction: [],
          note: new NoteLine({
            content: [],
            parts: [
              {
                text: 'note note',
                type: 'StringPart',
              },
            ],
          }),
          manuscripts: [
            new ManuscriptLineDisplay(
              Provenances.Nippur,
              PeriodModifiers['Early'],
              Periods['Ur III'],
              ManuscriptTypes.School,
              '1',
              [new OldSiglum('OS1', createReference(oldSiglumReferenceDto))],
              ['o'],
              new TextLine(lines[0]),
              [],
              [],
              [],
              'BM.X',
              false,
              'X.1',
            ),
          ],
        }),
      ],
      0,
    ),
    [`${chapterUrl}/lines/0`, false],
    Bluebird.resolve({
      variants: [
        {
          reconstruction: [],
          note: {
            prefix: '#note: ',
            content: [],
            parts: [
              {
                text: 'note note',
                type: 'StringPart',
              },
            ],
          },
          manuscripts: [
            {
              provenance: 'Nippur',
              periodModifier: 'Early',
              period: 'Ur III',
              siglumDisambiguator: '1',
              oldSigla: [
                {
                  siglum: 'OS1',
                  reference: oldSiglumReferenceDto,
                },
              ],
              type: 'School',
              labels: ['o'],
              line: lines[0],
              paratext: [],
              references: [],
              joins: [],
              museumNumber: 'BM.X',
              isInFragmentarium: false,
              accession: 'X.1',
            },
          ],
          parallelLines: [],
          intertext: [],
          originalIndex: 0,
          isPrimaryVariant: true,
        },
      ],
    }),
  ),
]

beforeEach(() => {
  setupProvenances()
})

describe('TextService', () => testDelegation(testService, testData))

test('injects note paratext and preserves non-note paratext', async () => {
  const entry = bibliographyEntryFactory.build()
  const reference = referenceDtoFactory.build()
  bibliographyServiceMock.findManyById.mockResolvedValue(
    new Map([[reference.id, entry]]),
  )
  apiClient.fetchJson.mockResolvedValue({
    variants: [
      {
        reconstruction: [],
        note: null,
        manuscripts: [
          {
            provenance: 'Nippur',
            periodModifier: 'Early',
            period: 'Ur III',
            siglumDisambiguator: '1',
            oldSigla: [],
            type: 'School',
            labels: ['o'],
            line: lines[0],
            paratext: [
              {
                prefix: '#note: ',
                content: [],
                parts: [{ reference, type: 'BibliographyPart' }],
                type: 'NoteLine',
              },
              singleRulingDto,
            ],
            references: [],
            joins: [],
            museumNumber: 'BM.X',
            isInFragmentarium: false,
            accession: 'X.1',
          },
        ],
        parallelLines: [],
        intertext: [],
        originalIndex: 0,
        isPrimaryVariant: true,
      },
    ],
  })

  const result = await testService.findChapterLine(chapterId, 0, 0)
  const paratext = result.variants[0].manuscripts[0].paratext

  expect(bibliographyServiceMock.findManyById).toHaveBeenCalledWith([
    reference.id,
  ])
  expect(paratext[0]).toMatchObject({
    type: 'NoteLine',
    parts: [
      {
        type: 'BibliographyPart',
        reference: { document: entry },
      },
    ],
  })
  expect(paratext[1]).toMatchObject({ type: 'RulingDollarLine' })
})
