import React from 'react'
import { render, screen } from '@testing-library/react'
import MapToolbar, { type MapPanelDefinition } from 'map/ui/MapToolbar'

it('returns focus to the original tool when its drawer closes', (): void => {
  const measure: MapPanelDefinition = {
    id: 'measurement',
    label: 'Measure',
    isSupported: true,
    render: (): JSX.Element => <p>Measure controls</p>,
  }
  const { rerender } = render(
    <MapToolbar panels={[measure]} active="measurement" onToggle={jest.fn()} />,
  )
  rerender(<MapToolbar panels={[measure]} active={null} onToggle={jest.fn()} />)
  expect(screen.getByRole('button', { name: 'Measure' })).toHaveFocus()
})

it('returns focus to the first available tool when the closed tool disappeared', (): void => {
  const measure: MapPanelDefinition = {
    id: 'measurement',
    label: 'Measure',
    isSupported: true,
    render: (): JSX.Element => <p>Measure controls</p>,
  }
  const { rerender } = render(
    <MapToolbar panels={[measure]} active="inspector" onToggle={jest.fn()} />,
  )
  rerender(<MapToolbar panels={[measure]} active={null} onToggle={jest.fn()} />)
  expect(screen.getByRole('button', { name: 'Measure' })).toHaveFocus()
})

it('closes safely when the last available tool disappears', (): void => {
  const { container, rerender } = render(
    <MapToolbar panels={[]} active="inspector" onToggle={jest.fn()} />,
  )
  rerender(<MapToolbar panels={[]} active={null} onToggle={jest.fn()} />)
  expect(container).toBeEmptyDOMElement()
  expect(document.body).toHaveFocus()
})
