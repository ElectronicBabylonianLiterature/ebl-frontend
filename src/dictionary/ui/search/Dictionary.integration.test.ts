import FakeApi from 'test-helpers/FakeApi'
import AppDriver from 'test-helpers/AppDriver'
import { submitForm } from 'test-helpers/utils'
import { wordDto } from 'test-helpers/test-word'

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
  expect(appDriver.getElement().container).toMatchSnapshot()
})

test('Query', async () => {
  fakeApi.expectSearchWords(query, words)
  appDriver.changeValueByLabel('Query', query)
  submitForm(appDriver.getElement(), 'form')
  await appDriver.waitForText(words[0].lemma.join(' '))
  expect(appDriver.getElement().container).toMatchSnapshot()
})
