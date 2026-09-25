import { INITIAL_CENTER, INITIAL_ZOOM, resetMapCamera } from 'map/mapCamera'
import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'

describe('resetMapCamera', () => {
  it('restores the initial center, zoom, pitch, and bearing', () => {
    const map = createMapMock()
    resetMapCamera(asLibreMap(map))
    expect(map.easeTo).toHaveBeenCalledWith({
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: 0,
      bearing: 0,
    })
  })

  it('is safe before map creation', () => {
    expect(() => resetMapCamera(null)).not.toThrow()
  })
})
