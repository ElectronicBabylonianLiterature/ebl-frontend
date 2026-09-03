import React from 'react'
import { render, renderHook, screen } from '@testing-library/react'
import type { Position } from 'geojson'
import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { resetMapLibreMock } from '__mocks__/maplibre-gl'
import MapElevationProfilePanel from './MapElevationProfilePanel'
import useMapElevationProfile from './useMapElevationProfile'
import type { MapElevationProfile } from './useMapElevationProfile'

const line: readonly Position[] = [
  [43.25, 35.45],
  [43.28, 35.45],
]

// Hoisted: the hook keys its effect on the array identity, exactly as it does
// on the stable `measurementPositions` state in production.
const longLine: readonly Position[] = [
  [43, 35],
  [44, 35],
]

const profile: MapElevationProfile = {
  status: 'ready',
  sampleCount: 3,
  profile: {
    samples: [
      { position: line[0], distanceMetres: 0, elevationMetres: 100 },
      { position: line[0], distanceMetres: 50, elevationMetres: 130 },
      { position: line[1], distanceMetres: 100, elevationMetres: 120 },
    ],
    distanceMetres: 100,
    minElevationMetres: 100,
    maxElevationMetres: 130,
    startElevationMetres: 100,
    endElevationMetres: 120,
    totalAscentMetres: 30,
    totalDescentMetres: 10,
  },
}

function mapWithElevation(elevation: number | null) {
  const map = createMapMock() as unknown as Record<string, unknown>
  map.queryTerrainElevation = jest.fn(() => elevation)
  return { current: asLibreMap(map as never) }
}

beforeEach(() => {
  resetMapLibreMock()
})

describe('MapElevationProfilePanel', () => {
  it('states every metric as text beside the chart', () => {
    render(<MapElevationProfilePanel elevation={profile} />)

    expect(screen.getByText('Minimum')).toBeInTheDocument()
    expect(screen.getByText('100 m')).toBeInTheDocument()
    expect(screen.getByText('130 m')).toBeInTheDocument()
    expect(screen.getByText('30 m')).toBeInTheDocument()
    expect(screen.getByText('10 m')).toBeInTheDocument()
    expect(screen.getByText('3 samples along 100 m')).toBeInTheDocument()
  })

  it('gives the chart an accessible summary', () => {
    render(<MapElevationProfilePanel elevation={profile} />)

    const chart = screen.getByRole('img', { name: /Modern elevation profile/ })
    expect(chart).toHaveAccessibleName(
      expect.stringContaining('Modern elevation profile'),
    )
    expect(chart).toHaveAccessibleName(expect.stringContaining('100 m'))
  })

  it('says the values are modern, not reconstructed', () => {
    render(<MapElevationProfilePanel elevation={profile} />)

    expect(
      screen.getByText(/do not reconstruct ancient topography/),
    ).toBeInTheDocument()
  })

  it.each([
    ['empty', /Measure a distance on the map/],
    ['terrain-unavailable', /Turn on the modern elevation model/],
    ['unsupported', /returned no elevation for this line/],
  ] as const)('reports the %s state', (status, message) => {
    render(
      <MapElevationProfilePanel
        elevation={{ status, profile: null, sampleCount: 0 }}
      />,
    )

    expect(screen.getByText(message)).toBeInTheDocument()
  })
})

describe('useMapElevationProfile', () => {
  // The map ref is hoisted per test for the same reason the positions are: the
  // effect keys on identity, and in production both are stable across renders.
  it('is empty until a line is completed', () => {
    const mapRef = mapWithElevation(140)
    const { result } = renderHook(() =>
      useMapElevationProfile(mapRef, [], true, 1.4),
    )

    expect(result.current.status).toBe('empty')
    expect(result.current.profile).toBeNull()
  })

  it('reports terrain as unavailable when it is switched off', () => {
    const mapRef = mapWithElevation(140)
    const { result } = renderHook(() =>
      useMapElevationProfile(mapRef, line, false, 1.4),
    )

    expect(result.current.status).toBe('terrain-unavailable')
  })

  it('reports unsupported when the terrain model returns nothing', () => {
    const mapRef = mapWithElevation(null)
    const { result } = renderHook(() =>
      useMapElevationProfile(mapRef, line, true, 1.4),
    )

    expect(result.current.status).toBe('unsupported')
    expect(result.current.profile).toBeNull()
  })

  it('reports unsupported when the map cannot query terrain at all', () => {
    const mapRef = { current: asLibreMap(createMapMock()) }
    const { result } = renderHook(() =>
      useMapElevationProfile(mapRef, line, true, 1.4),
    )

    expect(result.current.status).toBe('unsupported')
  })

  it('caps the samples it takes for a long line', () => {
    const mapRef = mapWithElevation(140)
    const { result } = renderHook(() =>
      useMapElevationProfile(mapRef, longLine, true, 1.4),
    )

    expect(result.current.sampleCount).toBe(128)
  })

  it('samples only once for a completed line', () => {
    const mapRef = mapWithElevation(140)
    renderHook(() => useMapElevationProfile(mapRef, line, true, 1.4))

    const query = (mapRef.current as unknown as Record<string, jest.Mock>)
      .queryTerrainElevation
    expect(query.mock.calls.length).toBeLessThanOrEqual(128)
  })

  it('removes exaggeration so the reported elevation is the source value', () => {
    const mapRef = mapWithElevation(280)
    const { result } = renderHook(() =>
      useMapElevationProfile(mapRef, line, true, 2),
    )

    expect(result.current.profile?.minElevationMetres).toBe(140)
  })
})
