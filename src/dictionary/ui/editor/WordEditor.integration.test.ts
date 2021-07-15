import FakeApi from 'test-support/FakeApi'
import AppDriver from 'test-support/AppDriver'
import { wordDto } from 'test-support/test-word'

const word = wordDto

let fakeApi: FakeApi
let appDriver: AppDriver

afterEach(() => {
  fakeApi.verifyExpectations()
})

beforeEach(async () => {
  fakeApi = new FakeApi().expectWord(word)
  appDriver = await new AppDriver(fakeApi.client)
    .withSession()
    .withPath(`/dictionary/${encodeURIComponent(word._id)}/edit`)
    .render()
})

test('Snapshot', () => {
  expect(appDriver.getView().container).toMatchSnapshot()
})

test('Edit', async () => {
  const newLegacyLemma = 'new lemma'
  fakeApi.expectUpdateWord({ ...word, legacyLemma: newLegacyLemma })
  await appDriver.changeValueByLabel('Legacy Lemma', newLegacyLemma)
  await appDriver.submitForm()
  expect(appDriver.getView().container).toMatchSnapshot()
})
