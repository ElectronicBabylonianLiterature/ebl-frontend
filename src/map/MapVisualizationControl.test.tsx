import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import MapVisualizationControl from 'map/MapVisualizationControl'
import { buildChoroplethLegend } from 'map/mapChoroplethScale'

describe('MapVisualizationControl', () => {
  const renderControl = (
    isDensityAvailable = false,
    hasUnavailableData = false,
    onModeChange = jest.fn(),
  ) =>
    render(
      <MapVisualizationControl
        mode="mapped"
        legend={buildChoroplethLegend('mapped', null, [])}
        isDensityAvailable={isDensityAvailable}
        hasUnavailableData={hasUnavailableData}
        onModeChange={onModeChange}
      />,
    )

  it('reports unavailable linked data without calling it unmapped', () => {
    renderControl(false, true)

    expect(screen.getByRole('status')).toHaveTextContent(
      /linked fragment data is loading or unavailable/,
    )
    expect(
      screen.getByText('Linked fragment data unavailable or loading'),
    ).toBeInTheDocument()
  })

  it('only offers density when at least one polygon has usable area', () => {
    const { rerender } = renderControl()
    expect(
      screen.queryByRole('option', { name: /Fragments per/ }),
    ).not.toBeInTheDocument()

    rerender(
      <MapVisualizationControl
        mode="mapped"
        legend={buildChoroplethLegend('mapped', null, [])}
        isDensityAvailable
        hasUnavailableData={false}
        onModeChange={jest.fn()}
      />,
    )
    expect(
      screen.getByRole('option', { name: /Fragments per/ }),
    ).toBeInTheDocument()
  })

  it('uses one truthful status when density classes are empty', () => {
    const { rerender } = render(
      <MapVisualizationControl
        mode="density"
        legend={buildChoroplethLegend('density', null, [0])}
        isDensityAvailable
        hasUnavailableData
        onModeChange={jest.fn()}
      />,
    )

    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(
      screen.queryByText(/No positive classifiable/),
    ).not.toBeInTheDocument()

    rerender(
      <MapVisualizationControl
        mode="density"
        legend={buildChoroplethLegend('density', null, [0])}
        isDensityAvailable
        hasUnavailableData={false}
        onModeChange={jest.fn()}
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'No positive classifiable density values are available.',
    )
  })

  it('publishes the selected visualization mode', () => {
    const onModeChange = jest.fn()
    renderControl(false, false, onModeChange)

    fireEvent.change(screen.getByLabelText('Visualize'), {
      target: { value: 'evidence' },
    })

    expect(onModeChange).toHaveBeenCalledWith('evidence')
  })
})
