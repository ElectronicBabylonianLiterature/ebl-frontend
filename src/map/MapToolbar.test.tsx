import React from 'react'
import { render, screen } from '@testing-library/react'
import MapToolbar, { type MapPanelDefinition } from './MapToolbar'

function panel(
  overrides: Partial<MapPanelDefinition> = {},
): MapPanelDefinition {
  return {
    id: 'export',
    label: 'Export',
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

  it('marks the active button as expanded and the rest as not', () => {
    render(
      <MapToolbar
        panels={[
          panel({ id: 'export', label: 'Export' }),
          panel({ id: 'terrain', label: 'Terrain' }),
        ]}
        active="export"
        onToggle={jest.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Export' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Terrain' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })
})
