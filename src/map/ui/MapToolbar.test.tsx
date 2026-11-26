import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from 'react-bootstrap'
import MapToolbar, { type MapPanelDefinition } from 'map/ui/MapToolbar'

function panel(
  overrides: Partial<MapPanelDefinition> = {},
): MapPanelDefinition {
  return {
    id: 'measurement',
    label: 'Measure',
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
          <Button onClick={showSelection}>Show selected area</Button>
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

  it('focuses the first supported tool when the closed tool was removed', () => {
    const onToggle = jest.fn()
    const { rerender } = render(
      <MapToolbar
        panels={[panel()]}
        active="measurement"
        onToggle={onToggle}
      />,
    )
    const original = screen.getByRole('button', { name: 'Measure' })
    original.focus()
    rerender(
      <MapToolbar
        panels={[
          panel({
            id: 'visualization',
            label: 'Visualization',
          }),
        ]}
        active={null}
        onToggle={onToggle}
      />,
    )
    expect(original).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Visualization' })).toHaveFocus()
  })

  it('keeps focus on the page when the last supported tool is removed', () => {
    const { rerender } = render(
      <MapToolbar
        panels={[panel()]}
        active="measurement"
        onToggle={jest.fn()}
      />,
    )
    screen.getByRole('button', { name: 'Measure' }).focus()
    rerender(<MapToolbar panels={[]} active={null} onToggle={jest.fn()} />)
    expect(document.body).toHaveFocus()
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
      <MapToolbar
        panels={[panel()]}
        active="measurement"
        onToggle={jest.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Measure' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('calls onToggle with the panel id when clicked', () => {
    const onToggle = jest.fn()
    render(<MapToolbar panels={[panel()]} active={null} onToggle={onToggle} />)

    screen.getByRole('button', { name: 'Measure' }).click()
    expect(onToggle).toHaveBeenCalledWith('measurement')
  })
  it('preserves focus outside the drawer when selection changes externally', () => {
    const props = { panels: [panel()], onToggle: jest.fn() }
    const { rerender } = render(
      <>
        <input aria-label="Map filter" />
        <MapToolbar {...props} active="measurement" />
      </>,
    )
    const input = screen.getByRole('textbox', { name: 'Map filter' })
    input.focus()
    rerender(
      <>
        <input aria-label="Map filter" />
        <MapToolbar {...props} active={null} />
      </>,
    )
    expect(input).toHaveFocus()
  })
})
