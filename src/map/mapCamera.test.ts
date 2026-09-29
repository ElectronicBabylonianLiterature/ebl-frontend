import type { Map as MapLibreMap } from 'maplibre-gl'
import { INITIAL_CENTER, INITIAL_ZOOM, resetMapCamera } from 'map/mapCamera'

describe('resetMapCamera', () => {
  it('restores the initial center, zoom, pitch, and bearing', () => {
    const easeTo = jest.fn()
    resetMapCamera({ easeTo } as unknown as MapLibreMap)

    expect(easeTo).toHaveBeenCalledWith({
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
