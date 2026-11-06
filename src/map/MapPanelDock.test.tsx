import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapPanelDock from 'map/MapPanelDock'
import useMapPanel from 'map/useMapPanel'

function Harness(): JSX.Element {
  const panel = useMapPanel()
  return (
    <MapPanelDock
      panel={panel}
      panels={[
        {
          id: 'layers',
          label: 'Map layers',
          isSupported: true,
          render: () => <p>Layer controls</p>,
        },
      ]}
    />
  )
}

it('closes a focused drawer with Escape and returns focus to its toolbar button', async () => {
  render(<Harness />)
  await userEvent.click(screen.getByRole('button', { name: 'Map layers' }))
  await userEvent.keyboard('{Escape}')

  expect(screen.queryByText('Layer controls')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Map layers' })).toHaveFocus()
})

it('keeps the drawer open for ordinary keyboard input', async () => {
  render(<Harness />)
  const button = screen.getByRole('button', { name: 'Map layers' })
  expect(button).not.toHaveAttribute('aria-controls')
  await userEvent.click(button)
  await userEvent.keyboard('{ArrowDown}')
  expect(screen.getByText('Layer controls')).toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Map layers' })).toBeVisible()
  expect(button).toHaveAttribute('aria-controls', 'map-panel-drawer')
})
