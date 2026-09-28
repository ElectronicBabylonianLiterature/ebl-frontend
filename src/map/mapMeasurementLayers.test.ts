import { measurementCollection } from 'map/mapMeasurementLayers'

describe('measurementCollection', () => {
  it('emits only points until there are two vertices', () => {
    const collection = measurementCollection('distance', [[1, 2]])
    expect(collection.features).toHaveLength(1)
    expect(collection.features[0].geometry.type).toBe('Point')
  })

  it('keeps distance paths open', () => {
    const collection = measurementCollection('distance', [
      [1, 2],
      [3, 4],
    ])
    const line = collection.features[2].geometry
    expect(line.type).toBe('LineString')
    if (line.type === 'LineString') {
      expect(line.coordinates).toEqual([
        [1, 2],
        [3, 4],
      ])
    }
  })

  it('closes the displayed area path without duplicating a closed vertex', () => {
    const open = measurementCollection('area', [
      [1, 2],
      [3, 4],
      [5, 6],
    ])
    const closed = measurementCollection('area', [
      [1, 2],
      [3, 4],
      [5, 6],
      [1, 2],
    ])
    const openLine = open.features[3].geometry
    const closedLine = closed.features[4].geometry

    expect(openLine.type === 'LineString' && openLine.coordinates).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
      [1, 2],
    ])
    expect(closedLine.type === 'LineString' && closedLine.coordinates).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
      [1, 2],
    ])
  })
})
