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

describe('Diplay chapter', () => {
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
          manuscripts: [
            {
              provenance: 'Standard Text',
              periodModifier: 'None',
              period: 'None',
              siglumDisambiguator: '1',
              type: 'None',
              labels: ['o'],
              line: lines[0],
              paratext: [singleRulingDto],
            },
            {
              provenance: 'Nippur',
              periodModifier: 'Early',
              period: 'Ur III',
              siglumDisambiguator: '1',
              type: 'Parallel',
              labels: [''],
              line: lines[0],
              paratext: [],
            },
            {
              provenance: 'Nippur',
              periodModifier: 'None',
              period: 'Ur III',
              siglumDisambiguator: '1',
              type: 'School',
              labels: [''],
              line: { type: 'EmptyLine', content: [], prefix: '' },
              paratext: [],
            },
          ],
        },
      ],
    })
    appDriver.clickByRole('button', 'Show score', 0)
    await appDriver.waitForText(/single ruling/)
    expect(appDriver.getView().container).toMatchSnapshot()
  })

  test('Show note', () => {
    appDriver.clickByRole('button', 'Show note', 0)
    expect(appDriver.getView().container).toMatchSnapshot()
  })

  test('Show parallels', () => {
    appDriver.clickByRole('button', 'Show parallels', 0)
    expect(appDriver.getView().container).toMatchSnapshot()
  })

  test('Sidebar', async () => {
    chapter.lines.forEach((line, index) => {
      fakeApi.expectLineDetails(chapter.id, index, {
        variants: [
          {
            manuscripts: [
              {
                provenance: 'Standard Text',
                periodModifier: 'None',
                period: 'None',
                siglumDisambiguator: '',
                type: 'None',
                labels: [],
                line: lines[index],
                paratext: [singleRulingDto],
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
      )}/${encodeURIComponent(chapter.id.stage)}/${encodeURIComponent(
        chapter.id.name
      )}`
    )
    .render()

  const stage = chapter.isSingleStage ? '' : `${chapter.id.stage} `
  await appDriver.waitForText(`Chapter ${stage}${chapter.id.name}`)
}
