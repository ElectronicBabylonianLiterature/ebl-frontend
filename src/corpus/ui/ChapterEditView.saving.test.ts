import { fireEvent } from '@testing-library/react'
import AppDriver from 'test-support/AppDriver'
import FakeApi from 'test-support/FakeApi'
import { createChapterUrl } from 'test-support/FakeApiExpectation'
import {
  chapterDtos,
  setUpChapterEditView,
} from 'corpus/ui/ChapterEditView.testSupport'

let fakeApi: FakeApi
let appDriver: AppDriver

async function setup(chapter): Promise<void> {
  const context = await setUpChapterEditView(chapter)
  fakeApi = context.fakeApi
  appDriver = context.appDriver
}

afterEach(() => {
  fakeApi.verifyExpectations()
})

test('Save alignment', async () => {
  const chapter = chapterDtos[0]
  await setup(chapter)
  fakeApi.expectUpdateAlignment(chapter, { alignment: [] })

  appDriver.click('Alignment')
  await appDriver.waitForText('Save alignment')
  appDriver.click('Save alignment')

  await appDriver.waitForTextToDisappear('Saving...')
})

test('Save lemmatization', async () => {
  const chapter = chapterDtos[0]
  await setup(chapter)
  fakeApi.expectUpdateLemmatization(chapter, { lemmatization: [] })

  appDriver.click('Lemmatization')
  await appDriver.waitForText('Save lemmatization')
  appDriver.click('Save lemmatization')

  await appDriver.waitForTextToDisappear('Saving...')
})

test('Shows an error when saving the alignment fails', async () => {
  const chapter = chapterDtos[0]
  await setup(chapter)

  appDriver.click('Alignment')
  await appDriver.waitForText('Save alignment')
  appDriver.click('Save alignment')

  await appDriver.waitForText(/Unexpected postJson/)
})

test('Import sends a single request when Save is double-clicked', async () => {
  const chapter = chapterDtos[0]
  await setup(chapter)
  fakeApi.expectImportChapter(chapter, '')
  const importPath = `${createChapterUrl(chapter)}/import`

  appDriver.click('Import')
  const saveButton = appDriver.getView().getByRole('button', { name: 'Save' })
  fireEvent.click(saveButton)
  fireEvent.click(saveButton)

  expect(saveButton).toBeDisabled()
  await appDriver.waitForTextToDisappear('Saving...')
  expect(
    fakeApi.client.postJson.mock.calls.filter(([path]) => path === importPath),
  ).toHaveLength(1)
})
