import AppDriver from 'test-support/AppDriver'
import FakeApi from 'test-support/FakeApi'
import { silenceConsoleErrors } from 'setupTests'
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
  silenceConsoleErrors()
  const chapter = chapterDtos[0]
  await setup(chapter)

  appDriver.click('Alignment')
  await appDriver.waitForText('Save alignment')
  appDriver.click('Save alignment')

  await appDriver.waitForText(/Unexpected postJson/)
})
