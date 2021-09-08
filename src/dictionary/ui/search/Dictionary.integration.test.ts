import FakeApi from 'test-support/FakeApi'
import AppDriver from 'test-support/AppDriver'
import { wordDto } from 'test-support/test-word'

const query = 'lem[ma?]'
const words = [wordDto]

let fakeApi: FakeApi
let appDriver: AppDriver

afterEach(() => {
  fakeApi.verifyExpectations()
})

beforeEach(async () => {
  fakeApi = new FakeApi()
  appDriver = await new AppDriver(fakeApi.client)
    .withSession()
    .withPath(`/dictionary`)
    .render()
})

test('Snapshot', () => {
  expect(appDriver.getView().container).toMatchSnapshot()
})

test('Query', async () => {
  fakeApi.expectSearchWords(query, words)
  await appDriver.changeValueByLabel('Query', query)
  await appDriver.submitForm()
  await appDriver.waitForText(words[0].lemma.join(' '))
  expect(appDriver.getView().container).toMatchSnapshot()
})
