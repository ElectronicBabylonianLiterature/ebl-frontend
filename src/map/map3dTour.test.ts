import { buildTourSteps, tourProgressLabel, type TourInput } from 'map/map3dTour'

const base: TourInput = {
  siteName: 'Aššur',
  siteBounds: [43.2, 35.4, 43.3, 35.5],
  excavationBounds: [43.24, 35.44, 43.27, 35.47],
  selectedPolygonBounds: null,
  activeOverlayBounds: null,
  isTerrainEnabled: false,
}

describe('buildTourSteps', () => {
  it('builds a step for every bounds the map already holds', () => {
    const steps = buildTourSteps(base)
    expect(steps.length).toBeGreaterThan(0)
    expect(steps.every((step) => step.bounds.length === 4)).toBe(true)
  })

  it('adds a step for the selected polygon when one is set', () => {
    const withSelection = buildTourSteps({
      ...base,
      selectedPolygonBounds: [43.25, 35.45, 43.26, 35.46],
    })
    expect(withSelection.length).toBeGreaterThan(buildTourSteps(base).length)
  })

  it('produces no steps when the site has no bounds', () => {
    expect(
      buildTourSteps({
        ...base,
        siteBounds: null,
        excavationBounds: null,
      }),
    ).toEqual([])
  })
})

describe('tourProgressLabel', () => {
  it('describes the current step position', () => {
    const steps = buildTourSteps(base)
    expect(tourProgressLabel(0, steps.length, steps[0])).toContain('1')
  })
})
