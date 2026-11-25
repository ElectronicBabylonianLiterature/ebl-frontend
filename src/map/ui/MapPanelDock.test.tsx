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
          id: 'measurement',
          label: 'Measure',
          isSupported: true,
          render: () => <p>Measure controls</p>,
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
  await userEvent.click(screen.getByRole('button', { name: 'Measure' }))
  await userEvent.click(screen.getByRole('button', { name: 'Close Measure' }))
  expect(screen.queryByText('Measure controls')).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Selected area' }))

  expect(screen.getByText('Area evidence')).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Close Selected area' }),
  ).toHaveFocus()
})

it('closes a focused tool panel with Escape and returns focus to its toolbar button', async () => {
  render(<PanelDock />)
  await userEvent.click(screen.getByRole('button', { name: 'Measure' }))
  await userEvent.keyboard('{Escape}')

  expect(screen.queryByText('Measure controls')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Measure' })).toHaveFocus()
})

it('keeps the tool panel open for ordinary keyboard input', async () => {
  render(<PanelDock />)
  const button = screen.getByRole('button', { name: 'Measure' })
  expect(button).not.toHaveAttribute('aria-controls')
  await userEvent.click(button)
  await userEvent.keyboard('{ArrowDown}')
  expect(screen.getByText('Measure controls')).toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Measure' })).toBeVisible()
  expect(button).toHaveAttribute('aria-controls', 'map-research-tool-panel')
})

it('closes an open tool when its toolbar button is pressed again', async () => {
  render(<PanelDock />)
  const button = screen.getByRole('button', { name: 'Measure' })
  await userEvent.click(button)
  expect(screen.getByText('Measure controls')).toBeVisible()

  await userEvent.click(button)

  expect(screen.queryByText('Measure controls')).not.toBeInTheDocument()
  expect(button).toHaveAttribute('aria-expanded', 'false')
})
