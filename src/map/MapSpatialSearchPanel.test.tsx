import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  panel,
  panelProps,
  renderPanel,
} from 'map/MapSpatialSearchPanel.testSupport'

const properties = panelProps({
  shape: { type: 'viewport', bounds: [43, 35, 44, 36] },
  result: {
    polygonIds: ['area'],
    findspotIds: Array.from({ length: 26 }, (_, index) => index),
    mappedPolygonCount: 1,
    accessibleFragmentCount: 26,
  },
})

it('supports keyboard paging backwards and announces each bounded range', async () => {
  renderPanel(properties)
  screen.getByRole('button', { name: 'Next findspots' }).focus()
  await userEvent.keyboard('{Enter}')
  expect(screen.getAllByRole('link')[0]).toHaveFocus()
  expect(
    screen.getByText('Showing 26–26 of 26 mapped findspots.'),
  ).toHaveAttribute('aria-live', 'polite')
  screen.getByRole('button', { name: 'Previous findspots' }).focus()
  await userEvent.keyboard(' ')
  expect(screen.getAllByRole('link')).toHaveLength(25)
  expect(screen.getAllByRole('link')[0]).toHaveFocus()
  expect(screen.getByText('Showing 1–25 of 26 mapped findspots.')).toBeVisible()
})

it.each(['idle', 'loading', 'error'] as const)(
  'keeps matches hidden while data is %s and resets the pager after recovery',
  async (dataStatus) => {
    const { rerender } = renderPanel(properties)
    await userEvent.click(
      screen.getByRole('button', { name: 'Next findspots' }),
    )
    rerender(panel({ ...properties, dataStatus }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'Tablet data is unavailable or still loading.',
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('group', { name: 'Findspot result pages' }),
    ).not.toBeInTheDocument()
    rerender(panel(properties))
    expect(
      screen.getByText('Showing 1–25 of 26 mapped findspots.'),
    ).toBeVisible()
  },
)
