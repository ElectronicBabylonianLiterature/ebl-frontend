import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapPanelDock from 'map/ui/MapPanelDock'
import useMapTools from 'map/ui/useMapTools'

function PanelDock(): JSX.Element {
  return (
    <MapPanelDock
      panel={useMapTools()}
      panels={[
        {
          id: 'layers',
          label: 'Map layers',
          isSupported: true,
          render: () => <p>Layer controls</p>,
        },
        {
          id: 'inspector',
          label: 'Selected area',
          isSupported: true,
          render: () => <p>Area evidence</p>,
        },
      ]}
    />
  )
}

it('expands and focuses a newly selected panel after collapsing another', async () => {
  render(<PanelDock />)
  await userEvent.click(screen.getByRole('button', { name: 'Map layers' }))
  await userEvent.click(
    screen.getByRole('button', { name: 'Close Map layers' }),
  )
  expect(screen.queryByText('Layer controls')).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Selected area' }))

  expect(screen.getByText('Area evidence')).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Close Selected area' }),
  ).toHaveFocus()
})

it('closes a focused tool panel with Escape and returns focus to its toolbar button', async () => {
  render(<PanelDock />)
  await userEvent.click(screen.getByRole('button', { name: 'Map layers' }))
  await userEvent.keyboard('{Escape}')

  expect(screen.queryByText('Layer controls')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Map layers' })).toHaveFocus()
})

it('keeps the tool panel open for ordinary keyboard input', async () => {
  render(<PanelDock />)
  const button = screen.getByRole('button', { name: 'Map layers' })
  expect(button).not.toHaveAttribute('aria-controls')
  await userEvent.click(button)
  await userEvent.keyboard('{ArrowDown}')
  expect(screen.getByText('Layer controls')).toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Map layers' })).toBeVisible()
  expect(button).toHaveAttribute('aria-controls', 'map-research-tool-panel')
})
