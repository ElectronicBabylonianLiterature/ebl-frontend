import TextService from 'corpus/application/TextService'
import { LineDetails, ManuscriptLineDisplay } from 'corpus/domain/line-details'
import { ManuscriptTypes, OldSiglum } from 'corpus/domain/manuscript'
import { Provenances } from 'corpus/domain/provenance'
import { PeriodModifiers } from 'common/utils/period'
import { Periods } from 'common/utils/periodDefinitions'
import { TextLine } from 'transliteration/domain/text-line'
import { NoteLine } from 'transliteration/domain/note-line'
import createReference from 'bibliography/application/createReference'
import { TestData } from 'test-support/utils'
import { lines } from 'test-support/test-fragment'
import { lineVariantDisplayFactory } from 'test-support/dictionary-line-fixtures'
import ApiClient from 'http/ApiClient'
import {
  chapterId,
  chapterUrl,
  oldSiglumReferenceDto,
} from 'corpus/application/TextService.testSupport'

export function createLineTestData(
  apiClient: jest.Mocked<ApiClient>,
): TestData<TextService> {
  return new TestData(
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
            new ManuscriptLineDisplay({
              provenance: Provenances.Nippur,
              periodModifier: PeriodModifiers['Early'],
              period: Periods['Ur III'],
              type: ManuscriptTypes.School,
              siglumDisambiguator: '1',
              oldSigla: [
                new OldSiglum('OS1', createReference(oldSiglumReferenceDto)),
              ],
              labels: ['o'],
              line: new TextLine(lines[0]),
              paratext: [],
              references: [],
              joins: [],
              museumNumber: 'BM.X',
              isInFragmentarium: false,
              accession: 'X.1',
            }),
          ],
        }),
      ],
      0,
    ),
    [`${chapterUrl}/lines/0`, false, undefined],
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
  )
}
