import React from 'react'
import { render, screen } from '@testing-library/react'
import MapLayerPanel from 'map/MapLayerPanel'

it('shows the pending geometry state in the layers panel', (): void => {
  render(
    <MapLayerPanel
      state={{
        selectedPolygon: null,
        showExcavationAreas: true,
        canShowExcavationAreas: false,
        excavationPolygons: [],
        isExcavationAreasLoading: true,
        experience: {
          setShowExcavationAreas: jest.fn(),
          setSelection: jest.fn(),
        },
        panel: { open: jest.fn() },
      }}
    />,
  )
  expect(screen.getByRole('status')).toHaveTextContent(
    'Loading excavation areas',
  )
})
