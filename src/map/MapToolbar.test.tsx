import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapToolbar, { type MapPanelDefinition } from './MapToolbar'
import MapSelectionPill from './MapSelectionPill'

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
  it('keeps the selection shortcut inside the measured wrapping toolbar', async () => {
    const showSelection = jest.fn()
    const props = { panels: [panel()], active: null, onToggle: jest.fn() }
    const { rerender } = render(
      <MapToolbar
        {...props}
        extraAction={
          <MapSelectionPill label="Show selected area" onShow={showSelection} />
        }
      />,
    )
    const toolbar = within(screen.getByRole('group', { name: 'Map tools' }))
    await userEvent.click(
      toolbar.getByRole('button', { name: 'Show selected area' }),
    )
    expect(showSelection).toHaveBeenCalledTimes(1)
    rerender(<MapToolbar {...props} />)
    expect(
      toolbar.queryByRole('button', { name: 'Show selected area' }),
    ).not.toBeInTheDocument()
  })

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
