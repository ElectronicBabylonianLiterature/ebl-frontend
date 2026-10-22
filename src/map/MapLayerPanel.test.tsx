import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapLayerPanel from 'map/MapLayerPanel'
import { excavationPolygon } from 'test-support/map-fixtures'

const polygon = excavationPolygon({ polygonId: 'area-a', siteId: 'assur' })

function panelState(): React.ComponentProps<typeof MapLayerPanel>['state'] {
  return {
    experience: {
      setShowExcavationAreas: jest.fn(),
      setSelection: jest.fn(),
    },
    panel: { open: jest.fn() },
    selectedPolygon: null,
    excavationPolygons: [polygon],
    showExcavationAreas: true,
    canShowExcavationAreas: true,
  }
}

it('keeps keyboard area selection and layer controls connected without opening another panel', async () => {
  const state = panelState()
  render(<MapLayerPanel state={state} />)

  await userEvent.selectOptions(
    screen.getByRole('combobox', { name: 'Select excavation area' }),
    polygon.polygonId,
  )
  expect(state.experience.setSelection).toHaveBeenCalledWith({
    type: 'excavation-area',
    polygonId: polygon.polygonId,
  })
  expect(state.panel.open).not.toHaveBeenCalled()
  await userEvent.click(
    screen.getByRole('checkbox', { name: 'Excavation areas' }),
  )
  expect(state.experience.setShowExcavationAreas).toHaveBeenCalledWith(false)
})

it('clears a selection without opening or closing a panel', async () => {
  const state = { ...panelState(), selectedPolygon: polygon }
  render(<MapLayerPanel state={state} />)

  const selector = screen.getByRole('combobox', {
    name: 'Select excavation area',
  })
  expect(selector).toHaveValue(polygon.polygonId)
  await userEvent.selectOptions(selector, '')
  expect(state.experience.setSelection).toHaveBeenCalledWith(null)
  expect(state.panel.open).not.toHaveBeenCalled()
})

it('opens the inspector only when View area is activated', async () => {
  const state = { ...panelState(), selectedPolygon: polygon }
  render(<MapLayerPanel state={state} />)

  await userEvent.click(screen.getByRole('button', { name: 'View area' }))

  expect(state.panel.open).toHaveBeenCalledWith('inspector')
  expect(state.experience.setSelection).not.toHaveBeenCalled()
})

it('disables unavailable excavation layers', async () => {
  const state = { ...panelState(), canShowExcavationAreas: false }
  render(<MapLayerPanel state={state} />)

  const checkbox = screen.getByRole('checkbox', { name: 'Excavation areas' })
  expect(checkbox).toBeDisabled()
  await userEvent.click(checkbox)
  expect(state.experience.setShowExcavationAreas).not.toHaveBeenCalled()
})
