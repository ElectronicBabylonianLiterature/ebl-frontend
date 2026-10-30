import { createLineTestData } from 'corpus/application/TextService.line.testSupport'
import { TestData, testDelegation } from 'test-support/utils'
import TextService from 'corpus/application/TextService'
import {
  text,
  textDto,
  chapter,
  chapterDto,
} from 'test-support/test-corpus-text'
import { fragment, fragmentDto, lines } from 'test-support/test-fragment'
import {
  bibliographyEntryFactory,
  referenceDtoFactory,
} from 'test-support/bibliography-fixtures'
import { singleRulingDto } from 'test-support/lines/dollar'
import {
  chapterDisplay,
  chapterId,
  chapterUrl,
  createTextServiceTestContext,
  extantLines,
} from 'corpus/application/TextService.testSupport'
import { textsDto } from 'corpus/application/TextService.update.testSupport'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const { apiClient, fragmentServiceMock, bibliographyServiceMock, textService } =
  createTextServiceTestContext()

const testData: TestData<TextService>[] = [
  new TestData(
    'find',
    [text.id],
    apiClient.fetchJson,
    text,
    [
      `/texts/${encodeURIComponent(text.genre)}/${encodeURIComponent(
        text.category,
      )}/${encodeURIComponent(text.index)}`,
      false,
      undefined,
    ],
    Promise.resolve(textDto),
  ),
  new TestData(
    'list',
    [],
    apiClient.fetchJson,
    [text],
    ['/texts', false],
    Promise.resolve(textsDto),
  ),
  new TestData(
    'findChapter',
    [chapterId],
    apiClient.fetchJson,
    chapter,
    [chapterUrl, false, undefined],
    Promise.resolve(chapterDto),
  ),
  new TestData(
    'findChapterDisplay',
    [chapterId],
    apiClient.fetchJson,
    chapterDisplay,
    [`${chapterUrl}/display`, false],
    Promise.resolve(chapterDisplay),
  ),
  createLineTestData(apiClient),
  new TestData(
    'findColophons',
    [chapterId],
    apiClient.fetchJson,
    [{ siglum: 'NinNA1a', text: fragment.text }],
    [`${chapterUrl}/colophons`, false, undefined],
    Promise.resolve([{ siglum: 'NinNA1a', text: fragmentDto.text }]),
  ),
  new TestData(
    'findUnplacedLines',
    [chapterId],
    apiClient.fetchJson,
    [{ siglum: 'NinNA1a', text: fragment.text }],
    [`${chapterUrl}/unplaced_lines`, false, undefined],
    Promise.resolve([{ siglum: 'NinNA1a', text: fragmentDto.text }]),
  ),
  new TestData(
    'findExtantLines',
    [chapterId],
    apiClient.fetchJson,
    extantLines,
    [`${chapterUrl}/extant_lines`, false, undefined],
    Promise.resolve(extantLines),
  ),
  new TestData(
    'findManuscripts',
    [chapterId],
    apiClient.fetchJson,
    chapter.manuscripts,
    [`${chapterUrl}/manuscripts`, false, undefined],
    Promise.resolve(chapterDto.manuscripts),
  ),
]

beforeEach(() => {
  fragmentServiceMock.fetchProvenances.mockReturnValue(Promise.resolve([]))
})

describe('TextService reads', () => testDelegation(textService, testData))

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

  const result = await textService.findChapterLine(chapterId, 0, 0)
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
