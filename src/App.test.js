import { factory } from 'factory-girl'
import AppDriver from 'test-helpers/AppDriver'
import FakeApi from 'test-helpers/FakeApi'

test.each(
  ['/', '/bibliography', '/bibliography_new', '/bibliography/entry_id', '/dictionary', '/dictionary/object_id', '/corpus', '/fragmentarium', '/fragmentarium/fragment_number', '/callback']
)('%s renders without crashing', async route => {
  const fakeApi = new FakeApi().expectStatistics(await factory.build('statistics'))
  new AppDriver(fakeApi.client)
    .withPath(route)
    .render()
})
