import React from 'react'
import { render, screen } from '@testing-library/react'
import MapToolbar, { type MapPanelDefinition } from './MapToolbar'

function panel(
  overrides: Partial<MapPanelDefinition> = {},
): MapPanelDefinition {
  return {
    id: 'layers',
    label: 'Map layers',
    isSupported: true,
    render: () => <p>content</p>,
    ...overrides,
  }
}

describe('MapToolbar', () => {
  it('renders nothing when no panel is supported', () => {
    const { container } = render(
      <MapToolbar
        panels={[panel({ isSupported: false })]}
        active={null}
        onToggle={jest.fn()}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('marks the active button as expanded', () => {
    render(
      <MapToolbar panels={[panel()]} active="layers" onToggle={jest.fn()} />,
    )

    expect(
      screen.getByRole('button', { name: 'Map layers' }),
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('calls onToggle with the panel id when clicked', () => {
    const onToggle = jest.fn()
    render(
      <MapToolbar panels={[panel()]} active={null} onToggle={onToggle} />,
    )

    screen.getByRole('button', { name: 'Map layers' }).click()
    expect(onToggle).toHaveBeenCalledWith('layers')
  })
})
