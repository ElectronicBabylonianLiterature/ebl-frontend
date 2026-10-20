import { findspotLabel } from 'map/findspotLabel'

describe('findspotLabel', () => {
  it('describes every available location field in order', () => {
    expect(
      findspotLabel({ sector: 'N', area: 'A', building: 'Temple', room: '3' }),
    ).toBe('N · A · Temple · 3')
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
