import { findspotLabel } from 'map/domain/findspotLabel'

describe('findspotLabel', () => {
  it('describes every available location field in order', () => {
    expect(
      findspotLabel({ sector: 'N', area: 'A', building: 'Temple', room: '3' }),
    ).toBe('N · A · Temple · Room 3')
  })

  it('names bare building and room identifiers', () => {
    expect(findspotLabel({ area: 'bB6I', building: '4', room: '12a' })).toBe(
      'bB6I · Building 4 · Room 12a',
    )
    expect(findspotLabel({ building: 'Building 4', room: 'Room 2' })).toBe(
      'Building 4 · Room 2',
    )
    expect(findspotLabel({ building: 'Palace', room: '4-5' })).toBe(
      'Palace · 4-5',
    )
  })

  it('omits missing and blank fields and trims the remaining values', () => {
    expect(
      findspotLabel({ sector: null, area: '  A  ', building: '', room: '  ' }),
    ).toBe('A')
  })

  it('provides an honest fallback without an arbitrary identifier', () => {
    expect(findspotLabel({})).toBe('Location details unavailable')
  })
})
