import { factory } from 'factory-girl'
import AppDriver from 'test-support/AppDriver'
import FakeApi from 'test-support/FakeApi'

test.each([
  '/',
  '/bibliography',
  '/bibliography_new',
  '/bibliography/entry_id',
  '/dictionary',
  '/dictionary/object_id',
  '/corpus',
  '/corpus/1/1',
  '/corpus/1/1/stage/name',
  '/fragmentarium',
  '/fragmentarium/fragment_number',
  '/callback',
])('%s renders without crashing', async (route) => {
  const fakeApi = new FakeApi().allowStatistics(
    await factory.build('statistics')
  )
  await new AppDriver(fakeApi.client).withPath(route).render()
})
