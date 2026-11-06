import React from 'react'
import { render, screen } from '@testing-library/react'
import MapToolbar, { type MapPanelDefinition } from 'map/MapToolbar'

it('returns focus to the original tool when its drawer closes', (): void => {
  const layers: MapPanelDefinition = {
    id: 'layers',
    label: 'Map layers',
    isSupported: true,
    render: (): JSX.Element => <p>Layers</p>,
  }
  const { rerender } = render(
    <MapToolbar panels={[layers]} active="layers" onToggle={jest.fn()} />,
  )
  rerender(<MapToolbar panels={[layers]} active={null} onToggle={jest.fn()} />)
  expect(screen.getByRole('button', { name: 'Map layers' })).toHaveFocus()
})

it('returns focus to the first available tool when the closed tool disappeared', (): void => {
  const layers: MapPanelDefinition = {
    id: 'layers',
    label: 'Map layers',
    isSupported: true,
    render: (): JSX.Element => <p>Layers</p>,
  }
  const { rerender } = render(
    <MapToolbar panels={[layers]} active="inspector" onToggle={jest.fn()} />,
  )
  rerender(<MapToolbar panels={[layers]} active={null} onToggle={jest.fn()} />)
  expect(screen.getByRole('button', { name: 'Map layers' })).toHaveFocus()
})

it('closes safely when the last available tool disappears', (): void => {
  const { container, rerender } = render(
    <MapToolbar panels={[]} active="inspector" onToggle={jest.fn()} />,
  )
  rerender(<MapToolbar panels={[]} active={null} onToggle={jest.fn()} />)
  expect(container).toBeEmptyDOMElement()
  expect(document.body).toHaveFocus()
})
