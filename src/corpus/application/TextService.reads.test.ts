import { TestData, testDelegation } from 'test-support/utils'
import TextService from 'corpus/application/TextService'
import {
  text,
  textDto,
  chapter,
  chapterDto,
} from 'test-support/test-corpus-text'
import { fragment, fragmentDto, lines } from 'test-support/test-fragment'
import { LineDetails, ManuscriptLineDisplay } from 'corpus/domain/line-details'
import { TextLine } from 'transliteration/domain/text-line'
import { ManuscriptTypes, OldSiglum } from 'corpus/domain/manuscript'
import { lineVariantDisplayFactory } from 'test-support/dictionary-line-fixtures'
import { PeriodModifiers, Periods } from 'common/utils/period'
import { Provenances } from 'corpus/domain/provenance'
import { NoteLine } from 'transliteration/domain/note-line'
import createReference from 'bibliography/application/createReference'
import {
  chapterDisplay,
  chapterId,
  chapterUrl,
  createTextServiceTestContext,
  extantLines,
  oldSiglumReferenceDto,
} from 'corpus/application/TextService.testSupport'
import { textsDto } from 'corpus/application/TextService.update.testSupport'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const { apiClient, fragmentServiceMock, textService } =
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
    [chapterUrl, false],
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
    Promise.resolve({
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
  new TestData(
    'findColophons',
    [chapterId],
    apiClient.fetchJson,
    [{ siglum: 'NinNA1a', text: fragment.text }],
    [`${chapterUrl}/colophons`, false],
    Promise.resolve([{ siglum: 'NinNA1a', text: fragmentDto.text }]),
  ),
  new TestData(
    'findUnplacedLines',
    [chapterId],
    apiClient.fetchJson,
    [{ siglum: 'NinNA1a', text: fragment.text }],
    [`${chapterUrl}/unplaced_lines`, false],
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
    [`${chapterUrl}/manuscripts`, false],
    Promise.resolve(chapterDto.manuscripts),
  ),
]

beforeEach(() => {
  fragmentServiceMock.fetchProvenances.mockReturnValue(Promise.resolve([]))
})

describe('TextService reads', () => testDelegation(textService, testData))
