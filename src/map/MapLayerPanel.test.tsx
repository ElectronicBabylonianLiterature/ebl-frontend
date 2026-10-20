import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapLayerPanel from 'map/MapLayerPanel'
import { excavationPolygon } from 'test-support/map-fixtures'

const polygon = excavationPolygon({ polygonId: 'area-a', siteId: 'assur' })

function panelState(): React.ComponentProps<typeof MapLayerPanel>['state'] {
  return {
    experience: { setShowExcavationAreas: jest.fn() },
    selectedPolygon: null,
    excavationPolygons: [polygon],
    showExcavationAreas: true,
    canShowExcavationAreas: true,
    selectPolygon: jest.fn(),
  }
}

it('keeps keyboard area selection and layer controls connected', async () => {
  const state = panelState()
  const clearSelection = jest.fn()
  render(<MapLayerPanel state={state} clearSelection={clearSelection} />)

  await userEvent.selectOptions(
    screen.getByRole('combobox', { name: 'Select excavation area' }),
    polygon.polygonId,
  )
  expect(state.selectPolygon).toHaveBeenCalledWith(polygon.polygonId)
  expect(clearSelection).not.toHaveBeenCalled()
  await userEvent.click(
    screen.getByRole('checkbox', { name: 'Excavation areas' }),
  )
  expect(state.experience.setShowExcavationAreas).toHaveBeenCalledWith(false)
})

it('delegates deselection to the callback that clears selection and closes the inspector', async () => {
  const state = { ...panelState(), selectedPolygon: polygon }
  const clearSelection = jest.fn()
  render(<MapLayerPanel state={state} clearSelection={clearSelection} />)

  const selector = screen.getByRole('combobox', {
    name: 'Select excavation area',
  })
  expect(selector).toHaveValue(polygon.polygonId)
  await userEvent.selectOptions(selector, '')
  expect(clearSelection).toHaveBeenCalledTimes(1)
  expect(state.selectPolygon).not.toHaveBeenCalled()
})

it('disables unavailable excavation layers', async () => {
  const state = { ...panelState(), canShowExcavationAreas: false }
  render(<MapLayerPanel state={state} clearSelection={jest.fn()} />)

  const checkbox = screen.getByRole('checkbox', { name: 'Excavation areas' })
  expect(checkbox).toBeDisabled()
  await userEvent.click(checkbox)
  expect(state.experience.setShowExcavationAreas).not.toHaveBeenCalled()
})
