import {
  buildFindspotFragmentSearchLink,
  buildFragmentSearchLink,
} from './mapLinks'

describe('buildFragmentSearchLink', () => {
  it('builds a link with the provenance name as site parameter', () => {
    const link = buildFragmentSearchLink('Babylon')
    expect(link).toBe('/library/search?site=Babylon')
  })

  it('encodes special characters in provenance names', () => {
    const link = buildFragmentSearchLink('Tell Dēr')
    expect(link).toBe('/library/search?site=Tell%20D%C4%93r')
  })

  it('handles empty string', () => {
    const link = buildFragmentSearchLink('')
    expect(link).toBe('/library/search?site=')
  })
})

describe('buildFindspotFragmentSearchLink', () => {
  it('links to fragment search by authoritative findspot ID', () => {
    expect(buildFindspotFragmentSearchLink(123)).toBe(
      '/library/search?findspotId=123',
    )
  })
})
