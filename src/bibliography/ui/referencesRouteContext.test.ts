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
    ['/bibliography/references', '/tools/references'],
    ['/bibliography/references/ABC', '/tools/references'],
    ['/unknown/path', '/tools/references'],
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

  test('defaults to tools references routes', () => {
    expect(referencesNewRoute('/unknown/path')).toEqual(
      '/tools/references/new-reference',
    )
  })
})
