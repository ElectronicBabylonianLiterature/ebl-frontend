import FakeApi from 'test-support/FakeApi'
import AppDriver from 'test-support/AppDriver'
import { wordDto } from 'test-support/test-word'

const query = {
  word: 'lem[ma?]',
  meaning: 'some meaning',
  root: 'lmm',
  vowelClass: 'a/a',
}
const words = [wordDto]

let fakeApi: FakeApi
let appDriver: AppDriver

afterEach(() => {
  fakeApi.verifyExpectations()
})

beforeEach(async () => {
  fakeApi = new FakeApi()
  appDriver = new AppDriver(fakeApi.client)
    .withSession()
    .withPath(`/dictionary`)
    .render()
})

test('Snapshot', () => {
  expect(appDriver.getView().container).toMatchSnapshot()
})

test.each([
  ['Word', 'word'],
  ['Meaning', 'meaning'],
  ['Root', 'root'],
  ['Vowel class', 'vowelClass'],
])('%s', async (label, attribute) => {
  fakeApi.expectSearchWords({ [attribute]: query[attribute] }, words)
  appDriver.changeValueByLabel(label, query[attribute])
  appDriver.click('Query', 0)
  await appDriver.waitForText(words[0].lemma.join(' '))
  expect(appDriver.getView().container).toMatchSnapshot()
})
