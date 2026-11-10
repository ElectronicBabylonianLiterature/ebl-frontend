import React from 'react'
import { render, screen } from '@testing-library/react'
import MapVisualizationControl from 'map/ui/MapVisualizationControl'
import { buildChoroplethLegend } from 'map/domain/mapChoroplethScale'

it('distinguishes a loaded zero-count classification from unavailable linked data', () => {
  const { rerender } = render(
    <MapVisualizationControl
      mode="count"
      legend={buildChoroplethLegend('count', null, [0])}
      isDensityAvailable={false}
      hasUnavailableData={false}
      onModeChange={jest.fn()}
    />,
  )
  expect(screen.getByRole('status')).toHaveTextContent(
    'No positive accessible tablet values are available to classify.',
  )
  rerender(
    <MapVisualizationControl
      mode="count"
      legend={buildChoroplethLegend('count', null, [])}
      isDensityAvailable={false}
      hasUnavailableData
      onModeChange={jest.fn()}
    />,
  )
  expect(screen.getByRole('status')).toHaveTextContent(/loading or unavailable/)
  expect(
    screen.queryByText(/No positive accessible tablet values/),
  ).not.toBeInTheDocument()
})

it('explains that evidence categories describe provenance rather than scholarly worth', () => {
  render(
    <MapVisualizationControl
      mode="evidence"
      legend={buildChoroplethLegend('evidence', null, [])}
      isDensityAvailable={false}
      hasUnavailableData={false}
      onModeChange={jest.fn()}
    />,
  )

  expect(
    screen.getByText(
      /Curated and verified-source mappings are both scholarly links/,
    ),
  ).toHaveTextContent('differ in where the link came from')
  expect(
    screen.queryByText(/No positive accessible tablet values/),
  ).not.toBeInTheDocument()
})
