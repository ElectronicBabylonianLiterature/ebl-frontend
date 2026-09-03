import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Map3dPanel, { type Map3dPanelProps } from './Map3dPanel'
import { buildExtrusionScale } from './mapExtrusionScale'
import { buildVisualizationValues } from './mapVisualizationValues'
import { aggregateFindspotMapData } from 'map/findspotMapDataSanitizer'
import { AWS_TERRAIN_TILES } from './mapTerrainSource'
import { excavationPolygon, findspotMapDataDto as findspotMapData } from 'test-support/map-fixtures'

const values = buildVisualizationValues(
  aggregateFindspotMapData([
    findspotMapData({ polygonIds: ['a'], accessibleFragmentCount: 9 }),
  ]),
  new Map([['assur', [excavationPolygon({ polygonId: 'a' })]]]),
)

const terrain = {
  isSupported: true,
  source: AWS_TERRAIN_TILES,
  exaggeration: 1.4,
  unavailableReason: null,
  isEnabled: true,
}

function props(overrides: Partial<Map3dPanelProps> = {}): Map3dPanelProps {
  return {
    mode: 'extrusion',
    metric: 'accessible-fragments',
    extrusionScale: 1,
    terrainExaggeration: 1.4,
    hillshadeVisible: true,
    scale: buildExtrusionScale('accessible-fragments', values),
    terrain,
    tour: {
      steps: [],
      isRunning: false,
      index: 0,
      canStart: true,
      start: jest.fn(),
      next: jest.fn(),
      previous: jest.fn(),
      exit: jest.fn(),
    },
    hasExtrusionData: true,
    isDensityAvailable: true,
    onModeChange: jest.fn(),
    onMetricChange: jest.fn(),
    onExtrusionScaleChange: jest.fn(),
    onTerrainExaggerationChange: jest.fn(),
    onHillshadeChange: jest.fn(),
    ...overrides,
  }
}

function renderPanel(overrides: Partial<Map3dPanelProps> = {}) {
  const resolved = props(overrides)
  return { props: resolved, ...render(<Map3dPanel {...resolved} />) }
}

describe('view controls', () => {
  it('labels every supported view', () => {
    renderPanel()

    expect(screen.getByLabelText('2D')).toBeInTheDocument()
    expect(screen.getByLabelText('Modern terrain')).toBeInTheDocument()
    expect(screen.getByLabelText('Analytical extrusion')).toBeChecked()
  })

  it('hides extrusion without mapped polygon data', () => {
    renderPanel({ mode: 'terrain', hasExtrusionData: false })

    expect(
      screen.queryByLabelText('Analytical extrusion'),
    ).not.toBeInTheDocument()
  })

  it('hides terrain when the device cannot support it', () => {
    renderPanel({
      mode: '2d',
      terrain: { ...terrain, isSupported: false, isEnabled: false },
    })

    expect(screen.queryByLabelText('Modern terrain')).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText(/Terrain exaggeration/),
    ).not.toBeInTheDocument()
  })

  it('switches view', async () => {
    const { props: resolved } = renderPanel()

    await userEvent.click(screen.getByLabelText('2D'))

    expect(resolved.onModeChange).toHaveBeenCalledWith('2d')
  })
})

describe('extrusion controls', () => {
  it('appears only in extrusion mode', () => {
    renderPanel({ mode: 'terrain' })

    expect(screen.queryByLabelText('Height represents')).not.toBeInTheDocument()
  })

  it('offers every metric and changes it', async () => {
    const { props: resolved } = renderPanel()

    await userEvent.selectOptions(
      screen.getByLabelText('Height represents'),
      'log-fragments',
    )

    expect(resolved.onMetricChange).toHaveBeenCalledWith('log-fragments')
  })

  it('hides density when no geodesic area is usable', () => {
    renderPanel({ isDensityAvailable: false })

    expect(
      screen.queryByRole('option', { name: 'Accessible fragments per km²' }),
    ).not.toBeInTheDocument()
  })

  it('states the disclaimer as text, not only in documentation', () => {
    renderPanel()

    expect(
      screen.getByText(
        /does not represent building height, stratigraphy, or ancient elevation/,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/analytical units on a capped scale, not metres/),
    ).toBeInTheDocument()
  })

  it('says so plainly when nothing can be extruded', () => {
    renderPanel({ scale: null })

    expect(
      screen.getByText(/No mapped polygon has a value for this metric/),
    ).toBeInTheDocument()
  })
})

describe('relief and tour controls', () => {
  it('exposes the exaggeration as a labelled, focusable range input', () => {
    renderPanel()
    const slider = screen.getByLabelText(/Terrain exaggeration/)

    expect(slider).toHaveAttribute('type', 'range')
    expect(slider).toHaveAttribute('min', '0.5')
    expect(slider).toHaveAttribute('max', '2.5')
    slider.focus()
    expect(slider).toHaveFocus()
  })

  it('reports a new exaggeration value', () => {
    const { props: resolved } = renderPanel()

    fireEvent.change(screen.getByLabelText(/Terrain exaggeration/), {
      target: { value: '1.9' },
    })

    expect(resolved.onTerrainExaggerationChange).toHaveBeenCalledWith(1.9)
  })

  it('reports a new extrusion height scale', () => {
    const { props: resolved } = renderPanel()

    fireEvent.change(screen.getByLabelText(/Height scale/), {
      target: { value: '1.6' },
    })

    expect(resolved.onExtrusionScaleChange).toHaveBeenCalledWith(1.6)
  })

  it('toggles hillshade', async () => {
    const { props: resolved } = renderPanel()

    await userEvent.click(screen.getByLabelText('Hillshade'))

    expect(resolved.onHillshadeChange).toHaveBeenCalledWith(false)
  })

  it('says the terrain is modern, not a reconstruction', () => {
    renderPanel()

    expect(
      screen.getByText(/not a reconstruction of the ancient landscape/),
    ).toBeInTheDocument()
  })

  it('hides the tour when no site is selected', () => {
    renderPanel({
      tour: { ...props().tour, canStart: false },
    })

    expect(
      screen.queryByRole('button', { name: 'Start 3D tour' }),
    ).not.toBeInTheDocument()
  })
})
