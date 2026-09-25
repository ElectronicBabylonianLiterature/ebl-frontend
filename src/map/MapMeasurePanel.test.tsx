import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapMeasurePanel from 'map/MapMeasurePanel'
import type { MeasurementController } from 'map/useMapMeasurement'

function controller(
  overrides: Partial<MeasurementController> = {},
): MeasurementController {
  return {
    mode: 'distance',
    units: 'metric',
    measurement: {
      mode: 'distance',
      vertexCount: 0,
      valueInBaseUnits: null,
      label: 'Select points on the map to measure a distance.',
    },
    pointCount: 0,
    isAtPointLimit: false,
    setMode: jest.fn(),
    setUnits: jest.fn(),
    addPointAtCenter: jest.fn(),
    clear: jest.fn(),
    removeLastPoint: jest.fn(),
    ...overrides,
  }
}

describe('MapMeasurePanel', () => {
  it('exposes mode, unit, result, instructions, and safe initial actions', () => {
    const measurement = controller()
    render(<MapMeasurePanel measurement={measurement} />)

    expect(screen.getByRole('button', { name: 'Distance' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('status')).toHaveTextContent('Select points')
    expect(screen.getByText(/Backspace undoes; Escape clears/)).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Add point at map center' }),
    ).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Undo point' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled()
  })

  it('announces and enforces the point limit', () => {
    render(
      <MapMeasurePanel
        measurement={controller({ isAtPointLimit: true, pointCount: 100 })}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'Maximum of 100 points reached.',
    )
    expect(
      screen.getByRole('button', { name: 'Add point at map center' }),
    ).toBeDisabled()
  })

  it('routes every available control to the measurement controller', async () => {
    const measurement = controller({
      pointCount: 2,
      setMode: jest.fn(),
      setUnits: jest.fn(),
      addPointAtCenter: jest.fn(),
      removeLastPoint: jest.fn(),
      clear: jest.fn(),
    })
    render(<MapMeasurePanel measurement={measurement} />)

    await userEvent.click(screen.getByRole('button', { name: 'Area' }))
    await userEvent.click(screen.getByLabelText('Imperial units'))
    await userEvent.click(
      screen.getByRole('button', { name: 'Add point at map center' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Undo point' }))
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(measurement.setMode).toHaveBeenCalledWith('area')
    expect(measurement.setUnits).toHaveBeenCalledWith('imperial')
    expect(measurement.addPointAtCenter).toHaveBeenCalled()
    expect(measurement.removeLastPoint).toHaveBeenCalled()
    expect(measurement.clear).toHaveBeenCalled()
  })
})
