import {
  getReferencesRouteRoot,
  referencesNewRoute,
  referencesEntryRoute,
  referencesEditRoute,
} from './referencesRouteContext'

describe('referencesRouteContext', () => {
  test.each([
    ['/tools/references', '/tools/references'],
    ['/tools/references/ABC', '/tools/references'],
    [
      '/reference-library/bibliography/references',
      '/reference-library/bibliography/references',
    ],
    [
      '/reference-library/bibliography/references/ABC',
      '/reference-library/bibliography/references',
    ],
    ['/bibliography/references', '/bibliography/references'],
    ['/bibliography/references/ABC', '/bibliography/references'],
    ['/unknown/path', '/bibliography/references'],
  ])('resolves route root for %s', (pathname, expectedRoot) => {
    expect(getReferencesRouteRoot(pathname)).toEqual(expectedRoot)
  })

  test('builds tools routes', () => {
    expect(referencesNewRoute('/tools/references')).toEqual(
      '/tools/references/new-reference',
    )
    expect(referencesEntryRoute('/tools/references', 'A B')).toEqual(
      '/tools/references/A%20B',
    )
    expect(referencesEditRoute('/tools/references', 'A B')).toEqual(
      '/tools/references/A%20B/edit',
    )
  })

  test('builds bibliography routes by default', () => {
    expect(referencesNewRoute('/unknown/path')).toEqual(
      '/bibliography/references/new-reference',
    )
  })
})
