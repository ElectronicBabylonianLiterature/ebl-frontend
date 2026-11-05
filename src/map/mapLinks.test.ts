import { buildFragmentSearchLink } from 'map/mapLinks'

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

  it('keeps query delimiters inside the site value', () => {
    const name = 'A & B = C # D?'

    const { searchParams } = new URL(
      buildFragmentSearchLink(name),
      'https://www.ebl.lmu.de',
    )

    expect(searchParams.get('site')).toBe(name)
    expect([...searchParams.keys()]).toEqual(['site'])
  })
})
