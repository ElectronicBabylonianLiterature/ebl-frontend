import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapPanelDock from 'map/MapPanelDock'
import useMapPanel from 'map/useMapPanel'
import useIsNarrowViewport from 'map/useIsNarrowViewport'

jest.mock('map/useIsNarrowViewport')
beforeEach(() => (useIsNarrowViewport as jest.Mock).mockReturnValue(true))

function Dock({ tools = true }: { tools?: boolean }): JSX.Element {
  return (
    <MapPanelDock
      panel={useMapPanel()}
      panels={[
        {
          id: 'layers',
          label: 'Map layers',
          isSupported: tools,
          render: () => <p>Layer controls</p>,
        },
      ]}
      status={<p role="alert">Excavation areas are unavailable.</p>}
    />
  )
}

it('keeps failure status outside the drawer body when it is collapsed', async () => {
  render(<Dock />)
  await userEvent.click(screen.getByRole('button', { name: 'Map layers' }))
  await userEvent.click(
    screen.getByRole('button', { name: 'Collapse Map layers' }),
  )
  const drawer = screen.getByRole('region', { name: 'Map layers' })
  expect(screen.queryByText('Layer controls')).not.toBeInTheDocument()
  expect(screen.getByRole('alert')).toBeVisible()
  expect(within(drawer).queryByRole('alert')).not.toBeInTheDocument()
})

it('keeps map status available when presentation hides the tool controls', () => {
  render(<Dock tools={false} />)
  expect(screen.getByRole('alert')).toBeVisible()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
