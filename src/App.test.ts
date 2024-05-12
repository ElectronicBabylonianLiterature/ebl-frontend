import AppDriver from 'test-support/AppDriver'
import FakeApi from 'test-support/FakeApi'
import { statisticsFactory } from 'test-support/fragment-data-fixtures'
import { tabIds as aboutTabIds } from 'about/ui/about'

test.each([
  '/',
  '/bibliography',
  '/bibliography/afo-register',
  '/bibliography/references',
  '/bibliography/references/new-reference',
  '/bibliography/references/entry_id',
  '/dictionary',
  '/dictionary/object_id',
  '/corpus',
  '/corpus/L/1/1',
  '/corpus/L/1/1/OB/name',
  '/corpus/L/1/1/NA/name/edit',
  '/fragmentarium',
  '/fragmentarium/search',
  '/fragmentarium/fragment_number',
  '/fragmentarium/fragment_id/match',
  '/callback',
  '/about',
  '/projects/CAIC',
  '/projects/CAIC/search',
  ...aboutTabIds.map((tabId) => '/about/' + tabId),
  '/tools',
  ...['date-converter', 'list-of-kings'].map((tabId) => '/about/' + tabId),
  '/signs',
  '/signs/sign_id',
])('%s renders without crashing', async (route) => {
  const fakeApi = new FakeApi().allowStatistics(statisticsFactory.build())
  const appDriver = new AppDriver(fakeApi.client).withPath(route).render()
  await appDriver.waitForTextToDisappear('Loading...')
})
