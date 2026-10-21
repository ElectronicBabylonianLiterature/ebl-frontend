import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapSelectionPill from 'map/MapSelectionPill'
import MapToolbar, { type MapPanelDefinition } from 'map/MapToolbar'

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

  it('marks the active button as expanded', () => {
    render(
      <MapToolbar panels={[panel()]} active="layers" onToggle={jest.fn()} />,
    )

    expect(screen.getByRole('button', { name: 'Map layers' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('calls onToggle with the panel id when clicked', () => {
    const onToggle = jest.fn()
    render(<MapToolbar panels={[panel()]} active={null} onToggle={onToggle} />)

    screen.getByRole('button', { name: 'Map layers' }).click()
    expect(onToggle).toHaveBeenCalledWith('layers')
  })
  it('focuses a remaining tool when the closed panel becomes unsupported', () => {
    const inspector = panel({
      id: 'inspector',
      label: 'Selected area',
    })
    const { rerender } = render(
      <MapToolbar
        panels={[panel(), inspector]}
        active="inspector"
        onToggle={jest.fn()}
      />,
    )

    rerender(
      <MapToolbar
        panels={[panel(), { ...inspector, isSupported: false }]}
        active={null}
        onToggle={jest.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Map layers' })).toHaveFocus()
  })
})
