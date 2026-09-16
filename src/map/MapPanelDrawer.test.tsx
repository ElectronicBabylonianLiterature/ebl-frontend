import React, { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapPanelDrawer from './MapPanelDrawer'

describe('MapPanelDrawer', () => {
  it('shows the title and the panel content', () => {
    render(
      <MapPanelDrawer title="Export" onClose={jest.fn()}>
        <p>Export content</p>
      </MapPanelDrawer>,
    )

    expect(screen.getByRole('region', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByText('Export content')).toBeInTheDocument()
  })

  it('focuses the close button on mount', () => {
    render(
      <MapPanelDrawer title="Export" onClose={jest.fn()}>
        <p>Export content</p>
      </MapPanelDrawer>,
    )

    expect(screen.getByRole('button', { name: 'Close Export' })).toHaveFocus()
  })

  it('calls onClose when the close button is pressed', async () => {
    const onClose = jest.fn()
    render(
      <MapPanelDrawer title="Export" onClose={onClose}>
        <p>Export content</p>
      </MapPanelDrawer>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Close Export' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('collapses and expands via the handle, hiding the body while collapsed', async () => {
    render(
      <MapPanelDrawer title="Export" onClose={jest.fn()}>
        <p>Export content</p>
      </MapPanelDrawer>,
    )
    const handle = screen.getByRole('button', { name: 'Collapse Export' })

    await userEvent.click(handle)

    expect(screen.queryByText('Export content')).not.toBeInTheDocument()
    const expandHandle = screen.getByRole('button', { name: 'Expand Export' })
    expect(expandHandle).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(expandHandle)

    expect(screen.getByText('Export content')).toBeInTheDocument()
  })

  it('attaches the root element to the given ref', () => {
    const rootRef = createRef<HTMLElement>()
    render(
      <MapPanelDrawer title="Export" onClose={jest.fn()} rootRef={rootRef}>
        <p>Export content</p>
      </MapPanelDrawer>,
    )

    expect(rootRef.current).toBe(screen.getByRole('region', { name: 'Export' }))
  })
})
