import Chance from 'chance'

import AppDriver from 'test-support/AppDriver'
import FakeApi from 'test-support/FakeApi'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { textIdToString } from 'corpus/domain/text'

const chance = new Chance('chapter-view-integration-test')

chapterDisplayFactory.rewindSequence()
const chapter = chapterDisplayFactory.build({}, { transient: { chance } })

let fakeApi: FakeApi
let appDriver: AppDriver

afterEach(() => {
  fakeApi.verifyExpectations()
})

describe('Diplay chapter', () => {
  beforeEach(async () => {
    await setup(chapter)
  })

  test('Breadcrumbs__', () => {
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
})

async function setup(chapter: ChapterDisplay) {
  fakeApi = new FakeApi().expectChapterDisplay(chapter)
  appDriver = await new AppDriver(fakeApi.client)
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
