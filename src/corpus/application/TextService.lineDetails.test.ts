import { isNoteLine } from 'transliteration/domain/type-guards'
import { lines } from 'test-support/test-fragment'
import {
  chapterId,
  chapterUrl,
  createTextServiceTestContext,
  oldSiglumReferenceDto,
} from 'corpus/application/TextService.testSupport'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const { apiClient, fragmentServiceMock, textService } =
  createTextServiceTestContext()

const noteText = 'a paratext note'

const noteLineDto = {
  type: 'NoteLine',
  prefix: '#note: ',
  content: [],
  parts: [{ text: noteText, type: 'StringPart' }],
}

const rulingLineDto = {
  type: 'RulingDollarLine',
  prefix: '$',
  content: [],
  number: 'SINGLE',
  status: null,
  displayValue: 'single ruling',
}

function lineDetailsDto(paratext: Record<string, unknown>[]) {
  return {
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
            oldSigla: [{ siglum: 'OS1', reference: oldSiglumReferenceDto }],
            type: 'School',
            labels: ['o'],
            line: lines[0],
            paratext: paratext,
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
  }
}

beforeEach(() => {
  fragmentServiceMock.fetchProvenances.mockReturnValue(Promise.resolve([]))
})

test('Injects references into a paratext note line', async () => {
  apiClient.fetchJson.mockResolvedValueOnce(lineDetailsDto([noteLineDto]))

  const lineDetails = await textService.findChapterLine(chapterId, 0, 0)
  const paratext = lineDetails.variants[0].manuscripts[0].paratext
  const noteLine = paratext[0]

  expect(apiClient.fetchJson).toHaveBeenCalledWith(
    `${chapterUrl}/lines/0`,
    false,
  )
  expect(isNoteLine(noteLine)).toBe(true)
  expect(isNoteLine(noteLine) && noteLine.parts).toEqual([
    { text: noteText, type: 'StringPart' },
  ])
})

test('Leaves a paratext line that is not a note untouched', async () => {
  apiClient.fetchJson.mockResolvedValueOnce(lineDetailsDto([rulingLineDto]))

  const lineDetails = await textService.findChapterLine(chapterId, 0, 0)
  const paratext = lineDetails.variants[0].manuscripts[0].paratext

  expect(paratext).toHaveLength(1)
  expect(isNoteLine(paratext[0])).toBe(false)
})
