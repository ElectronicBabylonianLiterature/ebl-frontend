import FakeApi from 'test-support/FakeApi'
import AppDriver from 'test-support/AppDriver'
import { wordDto } from 'test-support/test-word'

const query = {
  word: 'lem[ma?]',
  meaning: 'some meaning',
  root: 'lmm',
  vowelClass: ['a/a'],
  origin: ['CDA'],
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
])('%s', async (label, attribute) => {
  fakeApi.expectSearchWords(
    { [attribute]: query[attribute], origin: query.origin },
    words
  )
  appDriver.changeValueByLabel(label, query[attribute])
  appDriver.click('Query', 0)
  await appDriver.waitForText(words[0].lemma.join(' '))
  expect(appDriver.getView().container).toMatchSnapshot()
})

test('Vowel class', async () => {
  fakeApi.expectSearchWords(
    { vowelClass: query.vowelClass, origin: query.origin },
    words
  )
  appDriver.clickByRole('checkbox', /a\/a/)
  appDriver.click('Query', 0)
  await appDriver.waitForText(words[0].lemma.join(' '))
  expect(appDriver.getView().container).toMatchSnapshot()
})
