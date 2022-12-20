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

test('Word', async () => {
  fakeApi.expectSearchWords({ word: query.word }, words)
  appDriver.changeValueByLabel('Word', query.word)
  appDriver.click('Query', 0)
  await appDriver.waitForText(words[0].lemma.join(' '))
  expect(appDriver.getView().container).toMatchSnapshot()
})

test('Meaning', async () => {
  fakeApi.expectSearchWords({ meaning: query.meaning }, words)
  appDriver.changeValueByLabel('Meaning', query.meaning)
  appDriver.click('Query', 0)
  await appDriver.waitForText(words[0].lemma.join(' '))
  expect(appDriver.getView().container).toMatchSnapshot()
})

test('Root', async () => {
  fakeApi.expectSearchWords({ root: query.root }, words)
  appDriver.changeValueByLabel('Root', query.root)
  appDriver.click('Query', 0)
  await appDriver.waitForText(words[0].lemma.join(' '))
  expect(appDriver.getView().container).toMatchSnapshot()
})

test('vowelClass', async () => {
  fakeApi.expectSearchWords({ vowelClass: query.vowelClass }, words)
  appDriver.changeValueByLabel('Vowel class', query.vowelClass)
  appDriver.click('Query', 0)
  await appDriver.waitForText(words[0].lemma.join(' '))
  expect(appDriver.getView().container).toMatchSnapshot()
})
