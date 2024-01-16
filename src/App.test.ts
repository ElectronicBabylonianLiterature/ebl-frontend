import AppDriver from 'test-support/AppDriver'
import FakeApi from 'test-support/FakeApi'
import { statisticsFactory } from 'test-support/fragment-fixtures'

test.each([
  '/',
  '/bibliography',
  '/bibliography_new',
  '/bibliography/entry_id',
  '/dictionary',
  '/dictionary/object_id',
  '/corpus',
  '/corpus/L/1/1',
  '/corpus/L/1/1/OB/name',
  '/corpus/L/1/1/NA/name/edit',
  '/fragmentarium',
  '/fragmentarium/fragment_number',
  '/callback',
  '/about',
  '/tools',
  '/signs',
])('%s renders without crashing', async (route) => {
  const fakeApi = new FakeApi().allowStatistics(statisticsFactory.build())
  const appDriver = new AppDriver(fakeApi.client).withPath(route).render()
  await appDriver.waitForTextToDisappear('Loading...')
})
