import FakeApi from 'test-support/FakeApi'
import AppDriver from 'test-support/AppDriver'
import { wordDto } from 'test-support/test-word'
import { submitForm } from 'test-support/utils'

const word = wordDto

let fakeApi: FakeApi
let appDriver: AppDriver

afterEach(() => {
  fakeApi.verifyExpectations()
})

beforeEach(async () => {
  fakeApi = new FakeApi().expectWord(word)
  appDriver = new AppDriver(fakeApi.client)
    .withSession()
    .withPath(`/dictionary/${encodeURIComponent(word._id)}/edit`)
    .render()
  await appDriver.waitForText('Save')
})

test('Snapshot', () => {
  expect(appDriver.getView().container).toMatchSnapshot()
})

test('Edit', async () => {
  const newLegacyLemma = 'new lemma'
  fakeApi.expectUpdateWord({ ...word, legacyLemma: newLegacyLemma })
  appDriver.changeValueByLabel('Legacy Lemma', newLegacyLemma)
  await submitForm(appDriver.getView().container)
  await appDriver.waitForTextToDisappear('Saving...')
  expect(appDriver.getView().container).toMatchSnapshot()
})
