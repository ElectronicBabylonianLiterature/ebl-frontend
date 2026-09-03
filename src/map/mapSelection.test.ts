import {
  parseMapSelection,
  serializeMapSelection,
  type MapSelection,
} from 'map/mapSelection'

describe('map selection serialization', () => {
  const selection: MapSelection = {
    type: 'excavation-area',
    polygonId: 'assur-area-a-abc123',
  }

  it('round-trips an excavation-area selection', () => {
    expect(parseMapSelection(serializeMapSelection(selection))).toEqual(
      selection,
    )
  })

  it('serializes null to an empty string', () => {
    expect(serializeMapSelection(null)).toBe('')
  })

  it('parses empty or unknown values to null', () => {
    expect(parseMapSelection('')).toBeNull()
    expect(parseMapSelection('site:babylon')).toBeNull()
    expect(parseMapSelection('area:')).toBeNull()
  })
})
