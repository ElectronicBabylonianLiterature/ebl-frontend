import { measurementCollection } from 'map/mapMeasurementLayers'

describe('measurementCollection', () => {
  it('emits only points until there are two vertices', () => {
    const collection = measurementCollection([[1, 2]])
    expect(collection.features).toHaveLength(1)
    expect(collection.features[0].geometry.type).toBe('Point')
  })

  it('adds a connecting line once two or more points exist', () => {
    const collection = measurementCollection([
      [1, 2],
      [3, 4],
    ])
    expect(
      collection.features.map((feature) => feature.geometry.type),
    ).toEqual(['Point', 'Point', 'LineString'])
  })
})
