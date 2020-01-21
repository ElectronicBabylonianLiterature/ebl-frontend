import FakeApi from 'test-helpers/FakeApi'
import AppDriver from 'test-helpers/AppDriver'
import { wordDto } from 'test-helpers/test-word'

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
    .withPath(`/dictionary/${encodeURIComponent(word._id)}`)
    .render()
})

test('Snapshot', () => {
  expect(appDriver.getElement().container).toMatchSnapshot()
})

test('Edit', async () => {
  const newLegacyLemma = 'new lemma'
  fakeApi.expectUpdateWord({ ...word, legacyLemma: newLegacyLemma })
  appDriver.changeValueByLabel('Legacy Lemma', newLegacyLemma)
  await appDriver.submitForm()
  expect(appDriver.getElement().container).toMatchSnapshot()
})
