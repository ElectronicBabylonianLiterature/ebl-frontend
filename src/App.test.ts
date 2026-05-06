import AppDriver from 'test-support/AppDriver'
import FakeApi from 'test-support/FakeApi'
import { statisticsFactory } from 'test-support/fragment-data-fixtures'
import { tabIds as aboutTabIds } from 'about/ui/about'
import { tabIds as toolsTabIds } from 'router/Tools'

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
  '/library',
  '/library/search',
  '/library/fragment_number',
  '/library/fragment_id/match',
  '/library/fragment_id/record',
  '/library/fragment_id/html',
  '/callback',
  '/about',
  '/projects/CAIC',
  '/projects/CAIC/search',
  ...aboutTabIds.map((tabId) => '/about/' + tabId),
  '/tools',
  '/tools/introduction',
  ...toolsTabIds.map((tabId) => '/tools/' + tabId),
  '/tools/dictionary/object_id',
  '/tools/signs/sign_id',
  '/signs',
  '/signs/sign_id',
  '/impressum',
  '/datenschutz',
])('%s renders without crashing', async (route) => {
  window.scrollTo = jest.fn()
  const fakeApi = new FakeApi()
    .allowStatistics(statisticsFactory.build())
    .allowProvenances([])
    .allowDossiers([])
    .allowGenres([])
    .allowLatestFragments({ items: [], matchCountTotal: 0 })
  const appDriver = new AppDriver(fakeApi.client).withPath(route).render()
  await appDriver.waitForTextToDisappear('Loading...')
  if (route === '/') {
    await appDriver.waitForText('Latest Additions')
    expect(appDriver.getView().queryAllByRole('alert')).toHaveLength(0)
    expect(fakeApi.client.fetchJson).toHaveBeenCalledWith(
      '/fragments/latest',
      false,
    )
  }
})
