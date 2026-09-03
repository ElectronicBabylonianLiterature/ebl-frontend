import {
  MAX_CHOROPLETH_CLASSES,
  buildChoroplethLegend,
  buildChoroplethScale,
  isMapVisualizationMode,
  visualizationUnit,
  visualizationValueKey,
} from './mapChoroplethScale'

describe('mode helpers', () => {
  it('recognises only the supported modes', () => {
    expect(isMapVisualizationMode('count')).toBe(true)
    expect(isMapVisualizationMode('density')).toBe(true)
    expect(isMapVisualizationMode('heatmap')).toBe(false)
    expect(isMapVisualizationMode(undefined)).toBe(false)
  })

  it('reads density from its own feature-state key', () => {
    expect(visualizationValueKey('density')).toBe('densityPerSquareKm')
    expect(visualizationValueKey('count')).toBe('accessibleFragmentCount')
    expect(visualizationValueKey('log')).toBe('accessibleFragmentCount')
  })

  it('labels density with an explicit area unit', () => {
    expect(visualizationUnit('density')).toBe(
      'Accessible fragments per square kilometre',
    )
    expect(visualizationUnit('count')).toBe('Accessible fragments')
    expect(visualizationUnit('mapped')).toBe('Mapped status')
  })
})

describe('buildChoroplethScale', () => {
  it('has no scale in categorical mode', () => {
    expect(buildChoroplethScale('mapped', [1, 2, 3])).toBeNull()
  })

  it.each([
    ['no data', [] as number[]],
    ['all zero', [0, 0, 0]],
    ['negative or non-finite values only', [-1, Number.NaN]],
  ])('has no scale for %s', (_label, values) => {
    expect(buildChoroplethScale('count', values)).toBeNull()
  })

  it('produces a single class for one polygon', () => {
    const scale = buildChoroplethScale('count', [7])

    expect(scale?.breaks).toEqual([])
    expect(scale?.colors).toHaveLength(1)
  })

  it('produces ascending, unique breaks', () => {
    const scale = buildChoroplethScale('count', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    const breaks = scale?.breaks ?? []

    expect(breaks).toEqual([...breaks].sort((a, b) => a - b))
    expect(new Set(breaks).size).toBe(breaks.length)
    expect(scale?.colors).toHaveLength(breaks.length + 1)
  })

  it('never exceeds the available colour classes', () => {
    const scale = buildChoroplethScale(
      'count',
      Array.from({ length: 200 }, (_entry, index) => index + 1),
    )

    expect(scale?.colors.length).toBeLessThanOrEqual(MAX_CHOROPLETH_CLASSES)
  })

  it('keeps classes populated despite one extreme outlier', () => {
    const scale = buildChoroplethScale(
      'count',
      [1, 1, 2, 2, 3, 3, 4, 4, 5, 100000],
    )

    expect((scale?.breaks.length ?? 0) > 1).toBe(true)
    expect(scale?.breaks.every((value) => value < 100000)).toBe(true)
  })

  it('collapses to fewer classes when values repeat', () => {
    const scale = buildChoroplethScale('count', [5, 5, 5, 5, 5, 5])

    expect(scale?.breaks).toEqual([])
    expect(scale?.colors).toHaveLength(1)
  })

  it('spaces logarithmic breaks geometrically', () => {
    const scale = buildChoroplethScale('log', [1, 10, 100, 1000, 10000])
    const breaks = scale?.breaks ?? []

    expect(breaks.length).toBeGreaterThan(1)
    expect(breaks[breaks.length - 1] / breaks[0]).toBeGreaterThan(10)
  })

  it('classes density values under the density key', () => {
    const scale = buildChoroplethScale('density', [0.5, 1.5, 4, 9])

    expect(scale?.valueKey).toBe('densityPerSquareKm')
    expect(scale?.breaks.length).toBeGreaterThan(0)
  })
})

describe('buildChoroplethLegend', () => {
  it('reports an empty legend when nothing can be classified', () => {
    const legend = buildChoroplethLegend('count', null, [])

    expect(legend.classes).toEqual([])
    expect(legend.classifiedFeatureCount).toBe(0)
    expect(legend.unit).toBe('Accessible fragments')
  })

  it('describes contiguous ranges ending with an open class', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const scale = buildChoroplethScale('count', values)
    const legend = buildChoroplethLegend('count', scale, values)

    expect(legend.classes[0].from).toBe(1)
    expect(legend.classes[legend.classes.length - 1].to).toBeNull()
    expect(legend.classifiedFeatureCount).toBe(values.length)

    for (let index = 1; index < legend.classes.length; index += 1) {
      expect(legend.classes[index].from).toBe(legend.classes[index - 1].to)
    }
  })

  it('assigns one colour per class', () => {
    const values = [2, 4, 8, 16, 32]
    const scale = buildChoroplethScale('count', values)
    const legend = buildChoroplethLegend('count', scale, values)

    expect(new Set(legend.classes.map((entry) => entry.color)).size).toBe(
      legend.classes.length,
    )
  })

  it('counts only classifiable values', () => {
    expect(
      buildChoroplethLegend(
        'count',
        buildChoroplethScale('count', [0, 3]),
        [0, 3],
      ).classifiedFeatureCount,
    ).toBe(1)
  })
})
