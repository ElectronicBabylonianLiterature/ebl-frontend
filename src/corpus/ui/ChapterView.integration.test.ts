import _ from 'lodash'

import Chance from 'chance'

import AppDriver from 'test-support/AppDriver'
import FakeApi from 'test-support/FakeApi'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { textIdToString } from 'transliteration/domain/text-id'
import { textDto } from 'test-support/test-corpus-text'
import { waitFor } from '@testing-library/react'
import {
  restoreProvenanceState,
  snapshotProvenanceState,
  upsertProvenanceRecords,
} from 'test-support/provenance-state'
import {
  chapterViewProvenanceRecords,
  createChapterViewApi,
  createChapterViewPath,
  createShowManuscriptsLineDetails,
  createSidebarLineDetails,
} from 'corpus/ui/ChapterView.integration.testSupport'

const chance = new Chance('chapter-view-integration-test')

chapterDisplayFactory.rewindSequence()

const chapter = chapterDisplayFactory.published().build(
  {
    id: {
      textId: _.pick(textDto, 'genre', 'category', 'index'),
      ..._.pick(textDto.chapters[0], 'stage', 'name'),
    },
  },
  { transient: { chance } },
)

let fakeApi: FakeApi
let appDriver: AppDriver
let provenanceSnapshot = snapshotProvenanceState()

afterEach(() => {
  fakeApi.verifyExpectations()
})

describe('Display chapter', () => {
  beforeEach(async () => {
    provenanceSnapshot = snapshotProvenanceState()
    upsertProvenanceRecords(chapterViewProvenanceRecords)
    ;(URL.createObjectURL as jest.Mock).mockReturnValue('mock url')
    await setup(chapter)
  })

  afterEach(() => {
    restoreProvenanceState(provenanceSnapshot)
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
    expect(
      appDriver
        .getView()
        .getByText(`Chapter ${chapter.id.stage} ${chapter.id.name}`),
    ).toBeVisible()
  })

  test('Show manuscripts', async () => {
    fakeApi.expectLineDetails(
      chapter.id,
      0,
      createShowManuscriptsLineDetails(chance),
    )
    appDriver.clickByRole('button', 'Show score', 0)
    await appDriver.waitForText(/single ruling/)
    expect(appDriver.getView().container).toMatchSnapshot()
    expect(appDriver.getView().getByText(/single ruling/)).toBeVisible()
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
      fakeApi.expectLineDetails(
        chapter.id,
        line.originalIndex,
        createSidebarLineDetails(line.originalIndex),
      )
    })
    appDriver.click('Settings')
    await appDriver.waitForText('Score')
    appDriver.click('Score')
    await waitFor(() => {
      expect(appDriver.getView().queryAllByText(/Loading/).length).toEqual(0)
    })
    appDriver.click('Meter')
    appDriver.click('Parallels')
    appDriver.click('Notes')
    appDriver.click('Deutsch')
    appDriver.click('Close')
    await appDriver.waitForTextToDisappear('Close')

    appDriver.click('Settings')
    await appDriver.waitForText('Score')
    appDriver.expectChecked('Score')
    appDriver.expectChecked('Meter')
    appDriver.expectChecked('Parallels')
    appDriver.expectChecked('Notes')
    appDriver.click('Meter')
    appDriver.expectNotChecked('Meter')
    appDriver.click('Meter')
    appDriver.expectChecked('Meter')
    appDriver.click('Close')
    await appDriver.waitForTextToDisappear('Close')

    expect(appDriver.getView().container).toMatchSnapshot()
    expect(appDriver.getView().queryByText('Score')).not.toBeInTheDocument()
  })

  test('How to cite', async () => {
    appDriver.click('How to cite')
    const bibtexButton = await appDriver
      .getView()
      .findByRole('button', { name: /BibTeX/i })
    expect(appDriver.getView().container).toMatchSnapshot()
    expect(bibtexButton).toBeVisible()
  })
})

async function setup(chapter: ChapterDisplay): Promise<void> {
  fakeApi = createChapterViewApi(chapter, provenanceSnapshot)
  appDriver = new AppDriver(fakeApi.client)
    .withSession()
    .withPath(createChapterViewPath(chapter))
    .render()

  const stage = chapter.isSingleStage ? '' : `${chapter.id.stage} `
  await appDriver.waitForText(`Chapter ${stage}${chapter.id.name}`)
}
