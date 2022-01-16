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
  '/corpus/L/1/1/stage/name',
  '/corpus/L/1/1/stage/name/edit',
  '/fragmentarium',
  '/fragmentarium/fragment_number',
  '/callback',
])('%s renders without crashing', async (route) => {
  const fakeApi = new FakeApi().allowStatistics(statisticsFactory.build())
  await new AppDriver(fakeApi.client).withPath(route).render()
})
