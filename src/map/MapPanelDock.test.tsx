import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapPanelDock from 'map/MapPanelDock'
import useMapPanel from 'map/useMapPanel'
import useIsNarrowViewport from 'map/useIsNarrowViewport'

jest.mock('map/useIsNarrowViewport')

beforeEach(() => (useIsNarrowViewport as jest.Mock).mockReturnValue(true))

function PanelDock(): JSX.Element {
  return (
    <MapPanelDock
      panel={useMapPanel()}
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
    screen.getByRole('button', { name: 'Collapse Map layers' }),
  )
  expect(screen.queryByText('Layer controls')).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Selected area' }))

  expect(screen.getByText('Area evidence')).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Close Selected area' }),
  ).toHaveFocus()
})

it('closes a focused drawer with Escape and returns focus to its toolbar button', async () => {
  render(<PanelDock />)
  await userEvent.click(screen.getByRole('button', { name: 'Map layers' }))
  await userEvent.keyboard('{Escape}')

  expect(screen.queryByText('Layer controls')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Map layers' })).toHaveFocus()
})
