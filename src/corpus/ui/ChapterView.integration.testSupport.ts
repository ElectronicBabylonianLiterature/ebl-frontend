import _ from 'lodash'
import Chance from 'chance'
import AppDriver from 'test-support/AppDriver'
import FakeApi from 'test-support/FakeApi'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { textDto } from 'test-support/test-corpus-text'
import { stageToAbbreviation } from 'common/utils/period'
import {
  restoreProvenanceState,
  snapshotProvenanceState,
  upsertProvenanceRecords,
} from 'test-support/provenance-state'

const coldApplicationRenderTimeout = 30000

export const chance = new Chance('chapter-view-integration-test')

chapterDisplayFactory.rewindSequence()

export const chapter = chapterDisplayFactory.published().build(
  {
    id: {
      textId: _.pick(textDto, 'genre', 'category', 'index'),
      ..._.pick(textDto.chapters[0], 'stage', 'name'),
    },
  },
  { transient: { chance } },
)

export interface ChapterViewContext {
  fakeApi: FakeApi
  appDriver: AppDriver
}

function chapterPath(displayed: ChapterDisplay): string {
  return `/corpus/${encodeURIComponent(
    displayed.id.textId.genre,
  )}/${encodeURIComponent(displayed.id.textId.category)}/${encodeURIComponent(
    displayed.id.textId.index,
  )}/${encodeURIComponent(
    stageToAbbreviation(displayed.id.stage),
  )}/${encodeURIComponent(displayed.id.name)}`
}

export function registerChapterViewSetup(): ChapterViewContext {
  const context: ChapterViewContext = {
    fakeApi: new FakeApi(),
    appDriver: new AppDriver(new FakeApi().client),
  }
  let provenanceSnapshot = snapshotProvenanceState()

  beforeEach(async () => {
    provenanceSnapshot = snapshotProvenanceState()
    upsertProvenanceRecords([
      {
        id: 'standard-text',
        longName: 'Standard Text',
        abbreviation: 'Std',
        parent: null,
        sortKey: 1,
      },
      {
        id: 'nippur',
        longName: 'Nippur',
        abbreviation: 'Nip',
        parent: null,
        sortKey: 2,
      },
    ])
    jest.spyOn(URL, 'createObjectURL').mockReturnValue('mock url')
    const provenanceSnapshotDtos = provenanceSnapshot.map((record) =>
      Object.fromEntries(Object.entries(record)),
    )
    context.fakeApi = new FakeApi()
      .allowProvenances(provenanceSnapshotDtos)
      .expectChapterDisplay(chapter)
      .expectText(textDto)
    context.appDriver = new AppDriver(context.fakeApi.client)
      .withSession()
      .withPath(chapterPath(chapter))
      .render()
    await context.appDriver.waitForText(`Chapter ${chapter.id.name}`)
  }, coldApplicationRenderTimeout)

  afterEach(() => {
    restoreProvenanceState(provenanceSnapshot)
    context.fakeApi.verifyExpectations()
  })

  return context
}
