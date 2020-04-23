import _ from 'lodash'
import AppDriver from 'test-helpers/AppDriver'
import FakeApi from 'test-helpers/FakeApi'

const textsDto = [
  {
    category: 1,
    index: 2,
    name: 'First Category 2',
    numberOfVerses: 99,
    approximateVerses: false,
    chapters: [],
  },
  {
    category: 2,
    index: 1,
    name: 'Second Category',
    numberOfVerses: 2,
    approximateVerses: false,
    chapters: [],
  },
  {
    category: 3,
    index: 1,
    name: 'Third Category',
    numberOfVerses: 45,
    approximateVerses: true,
    chapters: [],
  },
  {
    category: 1,
    index: 1,
    name: 'First Category 1',
    numberOfVerses: 99,
    approximateVerses: false,
    chapters: [],
  },
  {
    category: 4,
    index: 1,
    name: 'Hidden Text',
    numberOfVerses: 1,
    approximateVerses: false,
    chapters: [],
  },
]

let fakeApi: FakeApi
let appDriver: AppDriver

afterEach(() => {
  fakeApi.verifyExpectations()
})

beforeEach(() => {
  fakeApi = new FakeApi()
  fakeApi.expectTexts(textsDto)
  fakeApi.allowImage('LibraryCropped.svg')
  appDriver = new AppDriver(fakeApi.client).withPath('/corpus')
})

test('With session', async () => {
  await appDriver.withSession().render()
  await appDriver.waitForText(RegExp(_.escapeRegExp('Narrative Poetry')))
  expect(appDriver.getElement().container).toMatchSnapshot()
})

test('Without session', async () => {
  await appDriver.render()
  await appDriver.waitForText(RegExp(_.escapeRegExp('Narrative Poetry')))
  expect(appDriver.getElement().container).toMatchSnapshot()
})
