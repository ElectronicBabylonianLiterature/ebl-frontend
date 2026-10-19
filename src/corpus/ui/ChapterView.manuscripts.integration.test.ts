import { lines } from 'test-support/test-fragment'
import { singleRulingDto } from 'test-support/lines/dollar'
import { oldSiglumDtoFactory } from 'test-support/old-siglum-fixtures'
import { referenceDtoFactory } from 'test-support/bibliography-fixtures'
import { joinDtoFactory } from 'test-support/join-fixtures'
import {
  chance,
  chapter,
  registerChapterViewSetup,
} from 'corpus/ui/ChapterView.integration.testSupport'

describe('Display chapter', () => {
  const context = registerChapterViewSetup()

  test('Show manuscripts', async () => {
    context.fakeApi.expectLineDetails(chapter.id, 0, {
      variants: [
        {
          originalIndex: 0,
          reconstruction: [],
          note: null,
          manuscripts: [
            {
              provenance: 'Standard Text',
              periodModifier: 'None',
              period: 'None',
              siglumDisambiguator: '1',
              oldSigla: [],
              type: 'None',
              labels: ['o'],
              line: lines[0],
              paratext: [singleRulingDto],
              references: [],
              joins: [],
              museumNumber: 'BM.X',
              isInFragmentarium: false,
              accession: 'X.1',
            },
            {
              provenance: 'Nippur',
              periodModifier: 'Early',
              period: 'Ur III',
              siglumDisambiguator: '1',
              oldSigla: [],
              type: 'Parallel',
              labels: [''],
              line: lines[0],
              paratext: [],
              references: [],
              joins: [],
              museumNumber: 'BM.X',
              isInFragmentarium: false,
              accession: 'X.1',
            },
            {
              provenance: 'Nippur',
              periodModifier: 'None',
              period: 'Ur III',
              siglumDisambiguator: '1',
              oldSigla: [],
              type: 'School',
              labels: [''],
              line: { type: 'EmptyLine', content: [], prefix: '' },
              paratext: [],
              references: [],
              joins: [],
              museumNumber: 'BM.X',
              isInFragmentarium: false,
              accession: 'X.1',
            },
            {
              provenance: 'Nippur',
              periodModifier: 'None',
              period: 'Ur III',
              siglumDisambiguator: '1',
              oldSigla: oldSiglumDtoFactory.buildList(
                2,
                {},
                { transient: { chance: chance } },
              ),
              type: 'School',
              labels: [''],
              line: { type: 'EmptyLine', content: [], prefix: '' },
              paratext: [],
              references: referenceDtoFactory.buildList(
                1,
                {},
                { transient: { chance: chance } },
              ),
              joins: [
                [
                  joinDtoFactory.build(
                    {
                      isInFragmentarium: true,
                    },
                    { transient: { chance: chance } },
                  ),
                  joinDtoFactory.build(
                    {
                      isInFragmentarium: false,
                    },
                    { transient: { chance: chance } },
                  ),
                ],
              ],
              museumNumber: 'BM.X',
              isInFragmentarium: false,
              accession: 'X.1',
            },
          ],
          parallelLines: [],
          intertext: [],
        },
      ],
    })
    context.appDriver.clickByRole('button', 'Show score', 0)
    await context.appDriver.waitForText(/single ruling/)
    expect(context.appDriver.getView().container).toMatchSnapshot()
    expect(context.appDriver.getView().getByText(/single ruling/)).toBeVisible()
  })
})
