import AppDriver from 'test-support/AppDriver'
import FakeApi from 'test-support/FakeApi'
import { textDto } from 'test-support/test-corpus-text'

let fakeApi: FakeApi
let appDriver: AppDriver

afterEach(() => {
  fakeApi.verifyExpectations()
})

beforeEach(() => {
  fakeApi = new FakeApi()
  fakeApi.expectText(textDto)
  appDriver = new AppDriver(fakeApi.client).withPath(
    `/corpus/${textDto.genre}/${textDto.category}/${textDto.index}`
  )
})

test('With session', async () => {
  await appDriver.withSession().render()
  await appDriver.waitForText(/This is a/)
  expect(appDriver.getView().container).toMatchSnapshot()
})

test('Without session', async () => {
  await appDriver.render()
  await appDriver.waitForText('Please log in to view the text.')
  expect(appDriver.getView().container).toMatchSnapshot()
})