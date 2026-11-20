import { initializeFindspotSource } from 'map/maplibre/mapFindspotSource'
import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { makeProvenance } from 'map/testFixtures/provenance'

it('installs findspots only once and updates their source when a style event repeats', () => {
  const map = createMapMock()
  const provenances = [makeProvenance()]
  initializeFindspotSource(asLibreMap(map), provenances, true)
  expect(map.addSource).toHaveBeenCalledTimes(1)
  expect(map.addLayer).toHaveBeenCalledTimes(3)
  expect(map.fitBounds).toHaveBeenCalledTimes(1)
  const setData = jest.fn()
  map.getSource.mockReturnValue({ setData })
  map.getLayer.mockReturnValue({})
  initializeFindspotSource(asLibreMap(map), provenances, false)
  expect(map.addSource).toHaveBeenCalledTimes(1)
  expect(map.addLayer).toHaveBeenCalledTimes(3)
  expect(setData).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'FeatureCollection' }),
  )
  expect(map.fitBounds).toHaveBeenCalledTimes(1)
})
