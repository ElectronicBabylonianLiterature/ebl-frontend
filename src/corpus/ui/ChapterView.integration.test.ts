import _ from 'lodash'

import Chance from 'chance'

import AppDriver from 'test-support/AppDriver'
import FakeApi from 'test-support/FakeApi'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { textIdToString } from 'transliteration/domain/text-id'
import { textDto } from 'test-support/test-corpus-text'
import { lines } from 'test-support/test-fragment'
import { singleRulingDto } from 'test-support/lines/dollar'
import { waitFor } from '@testing-library/react'
import { oldSiglumDtoFactory } from 'test-support/old-siglum-fixtures'
import { referenceDtoFactory } from 'test-support/bibliography-fixtures'
import { joinDtoFactory } from 'test-support/join-fixtures'
import { stageToAbbreviation } from 'common/period'

const chance = new Chance('chapter-view-integration-test')

chapterDisplayFactory.rewindSequence()

const chapter = chapterDisplayFactory.published().build(
  {
    id: {
      textId: _.pick(textDto, 'genre', 'category', 'index'),
      ..._.pick(textDto.chapters[0], 'stage', 'name'),
    },
  },
  { transient: { chance } }
)

let fakeApi: FakeApi
let appDriver: AppDriver

afterEach(() => {
  fakeApi.verifyExpectations()
})

describe('Display chapter', () => {
  beforeEach(async () => {
    await setup(chapter)
  })

  test('Breadcrumbs', () => {
    appDriver.breadcrumbs.expectCrumbs([
      'eBL',
      'Corpus',
      `${textIdToString(chapter.id.textId)} ${chapter.textName}`,
      `Chapter ${chapter.id.stage} ${chapter.id.name}`,
    ])
  })

  test('Snapshot', () => {
    expect(appDriver.getView().container).toMatchSnapshot()
  })

  test('Show manuscripts', async () => {
    fakeApi.expectLineDetails(chapter.id, 0, {
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
                { transient: { chance: chance } }
              ),
              type: 'School',
              labels: [''],
              line: { type: 'EmptyLine', content: [], prefix: '' },
              paratext: [],
              references: referenceDtoFactory.buildList(
                1,
                {},
                { transient: { chance: chance } }
              ),
              joins: [
                [
                  joinDtoFactory.build(
                    {
                      isInFragmentarium: true,
                    },
                    { transient: { chance: chance } }
                  ),
                  joinDtoFactory.build(
                    {
                      isInFragmentarium: false,
                    },
                    { transient: { chance: chance } }
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
    appDriver.clickByRole('button', 'Show score', 0)
    await appDriver.waitForText(/single ruling/)
    expect(appDriver.getView().container).toMatchSnapshot()
  })

  test('Show notes', () => {
    appDriver.clickByRole('button', 'Show notes', 0)
    expect(appDriver.getView().container).toMatchSnapshot()
  })

  test('Show parallels', () => {
    appDriver.clickByRole('button', 'Show parallels', 0)
    expect(appDriver.getView().container).toMatchSnapshot()
  })

  test('Sidebar', async () => {
    chapter.lines.forEach((line) => {
      fakeApi.expectLineDetails(chapter.id, line.originalIndex, {
        variants: [
          {
            originalIndex: 0,
            manuscripts: [
              {
                provenance: 'Standard Text',
                periodModifier: 'None',
                period: 'None',
                siglumDisambiguator: '',
                oldSigla: [],
                type: 'None',
                labels: [],
                line: lines[line.originalIndex],
                paratext: [singleRulingDto],
                references: [],
                joins: [],
                museumNumber: 'BM.X',
                isInFragmentarium: false,
                accession: 'X.1',
              },
            ],
          },
        ],
      })
    })
    appDriver.click('Settings')
    await appDriver.waitForText('Score')
    appDriver.click('Score')
    await waitFor(() => {
      expect(appDriver.getView().queryAllByText(/Loading/).length).toEqual(0)
    })
    expect(appDriver.getView().container).toMatchSnapshot()
    appDriver.click('Meter')
    expect(appDriver.getView().container).toMatchSnapshot()
    appDriver.click('Parallels')
    expect(appDriver.getView().container).toMatchSnapshot()
    appDriver.click('Notes')
    expect(appDriver.getView().container).toMatchSnapshot()
    appDriver.click('Deutsch')
    expect(appDriver.getView().container).toMatchSnapshot()
    appDriver.click('Close')
    await appDriver.waitForTextToDisappear('Close')
    expect(appDriver.getView().container).toMatchSnapshot()
  })

  test('How to cite', async () => {
    appDriver.click('How to cite')
    await appDriver.waitForTextToDisappear('Bibtex')
    expect(appDriver.getView().container).toMatchSnapshot()
  })
})

async function setup(chapter: ChapterDisplay) {
  fakeApi = new FakeApi().expectChapterDisplay(chapter).expectText(textDto)
  appDriver = new AppDriver(fakeApi.client)
    .withSession()
    .withPath(
      `/corpus/${encodeURIComponent(
        chapter.id.textId.genre
      )}/${encodeURIComponent(chapter.id.textId.category)}/${encodeURIComponent(
        chapter.id.textId.index
      )}/${encodeURIComponent(
        stageToAbbreviation(chapter.id.stage)
      )}/${encodeURIComponent(chapter.id.name)}`
    )
    .render()

  const stage = chapter.isSingleStage ? '' : `${chapter.id.stage} `
  await appDriver.waitForText(`Chapter ${stage}${chapter.id.name}`)
}
