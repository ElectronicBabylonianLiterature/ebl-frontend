import { testDelegation } from 'test-support/utils'
import { lines } from 'test-support/test-fragment'
import {
  bibliographyEntryFactory,
  referenceDtoFactory,
} from 'test-support/bibliography-fixtures'
import { singleRulingDto } from 'test-support/lines/dollar'
import { createLineTestData } from 'corpus/application/TextService.line.testSupport'
import {
  apiClient,
  bibliographyServiceMock,
  chapterId,
  setupProvenances,
  testService,
} from 'corpus/application/TextService.regression.testSupport'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const testData = [createLineTestData(apiClient)]

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
