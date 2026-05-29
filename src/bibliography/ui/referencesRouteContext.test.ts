import {
  getReferencesRouteRoot,
  referencesNewRoute,
  referencesEntryRoute,
  referencesEditRoute,
} from './referencesRouteContext'

describe('referencesRouteContext', () => {
  test('resolves route root', () => {
    expect(getReferencesRouteRoot()).toEqual('/tools/references')
  })

  test('builds tools routes', () => {
    expect(referencesNewRoute()).toEqual('/tools/references/new-reference')
    expect(referencesEntryRoute('A B')).toEqual('/tools/references/A%20B')
    expect(referencesEditRoute('A B')).toEqual('/tools/references/A%20B/edit')
  })

  test('defaults to tools references routes', () => {
    expect(referencesNewRoute()).toEqual('/tools/references/new-reference')
  })
})
