import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  panelProps,
  panel,
  renderPanel,
} from 'map/MapSpatialSearchPanel.testSupport'
import type { SpatialSearchPanelProps } from 'map/MapSpatialSearchPanel.testSupport'
import { findspotMapData } from 'test-support/map-fixtures'

function search(count = 52, firstId = 0): SpatialSearchPanelProps {
  const findspotIds = Array.from(
    { length: count },
    (_, index) => firstId + index,
  )
  return panelProps({
    shape: { type: 'viewport', bounds: [43, 35, 44, 36] },
    result: {
      polygonIds: ['area-a'],
      findspotIds,
      mappedPolygonCount: 1,
      accessibleFragmentCount: count,
    },
  })
}

async function nextPage(): Promise<void> {
  await userEvent.click(screen.getByRole('button', { name: 'Next findspots' }))
}

it('keeps all 1,027 matches reachable with at most 25 links per page', async () => {
  const spatialSearch = search(1027)
  renderPanel(spatialSearch)
  const visited: string[] = []

  for (let page = 0; page < 42; page += 1) {
    const links = screen.getAllByRole('link')
    expect(links.length).toBeLessThanOrEqual(25)
    visited.push(...links.map((link) => link.getAttribute('href') ?? ''))
    if (page < 41) await nextPage()
  }

  expect(visited).toEqual(
    spatialSearch.result.findspotIds.map(
      (id) => `/library/search?findspotId=${id}`,
    ),
  )
  expect(screen.getAllByRole('link')).toHaveLength(2)
  expect(screen.getAllByRole('link')[0]).toHaveFocus()
  expect(screen.getByRole('status')).toHaveTextContent('1027 mapped findspots')
  expect(screen.getByRole('button', { name: 'Next findspots' })).toBeDisabled()
  expect(
    screen.getByRole('group', { name: 'Findspot result pages' }),
  ).toBeVisible()
})

it('preserves the current page and focus when equivalent matches refresh', async () => {
  const spatialSearch = search()
  const { rerender } = renderPanel(spatialSearch)
  await nextPage()
  const searchButton = screen.getByRole('button', {
    name: 'Search current view',
  })
  act(() => searchButton.focus())

  rerender(
    panel(
      {
        ...spatialSearch,
        shape: { type: 'viewport', bounds: [43, 35, 44, 36] },
        result: {
          ...spatialSearch.result,
          findspotIds: [...spatialSearch.result.findspotIds],
          accessibleFragmentCount: 104,
        },
      },
      [findspotMapData({ findspotId: 25, area: 'Updated location' })],
    ),
  )

  expect(
    screen.getByText('Showing 26–50 of 52 mapped findspots.'),
  ).toBeVisible()
  expect(
    screen.getByRole('link', { name: 'Tablets from Updated location' }),
  ).toHaveAttribute('href', '/library/search?findspotId=25')
  expect(screen.getByRole('status')).toHaveTextContent('104 accessible tablets')
  expect(searchButton).toHaveFocus()
})

it('resets to the first page for changed IDs without stealing focus', async () => {
  const { rerender } = renderPanel(search())
  await nextPage()
  const searchButton = screen.getByRole('button', {
    name: 'Search current view',
  })
  act(() => searchButton.focus())
  rerender(panel(search(52, 100)))

  expect(screen.getByText('Showing 1–25 of 52 mapped findspots.')).toBeVisible()
  expect(screen.getAllByRole('link')[0]).toHaveAttribute(
    'href',
    '/library/search?findspotId=100',
  )
  expect(screen.getAllByRole('link')).toHaveLength(25)
  expect(searchButton).toHaveFocus()
})

it('resets for new bounds and an explicit repeat of the same viewport search', async () => {
  const spatialSearch = search()
  const { rerender } = renderPanel(spatialSearch)
  await nextPage()
  const changedShape = {
    ...spatialSearch,
    shape: {
      type: 'bounding-box' as const,
      bounds: [44, 35, 45, 36] as const,
    },
  }
  rerender(panel(changedShape))

  expect(screen.getByText('Showing 1–25 of 52 mapped findspots.')).toBeVisible()
  expect(screen.getByRole('status')).toHaveTextContent('Drawn rectangle')
  await nextPage()
  await userEvent.click(
    screen.getByRole('button', { name: 'Search current view' }),
  )

  expect(spatialSearch.onSearchViewport).toHaveBeenCalledTimes(1)
  expect(screen.getByText('Showing 1–25 of 52 mapped findspots.')).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Search current view' }),
  ).toHaveFocus()
})

it.each([false, true])(
  'resets after clearing or starting drawing (drawing=%s)',
  async (isDrawing) => {
    const spatialSearch = search()
    const { rerender } = renderPanel(spatialSearch)
    await nextPage()
    rerender(panel(panelProps({ isDrawing })))
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('group', { name: 'Findspot result pages' }),
    ).not.toBeInTheDocument()

    rerender(panel(spatialSearch))
    expect(
      screen.getByText('Showing 1–25 of 52 mapped findspots.'),
    ).toBeVisible()
  },
)

it.each([0, 25])(
  'keeps a %s-match result free of unnecessary pagination',
  (count) => {
    renderPanel(search(count))
    expect(screen.queryAllByRole('link')).toHaveLength(count)
    expect(
      screen.queryByRole('group', { name: 'Findspot result pages' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      `${count} mapped findspots`,
    )
  },
)

it.each([
  {
    label: 'appended matches',
    count: 77,
    firstId: 0,
    range: 'Showing 26–50 of 77 mapped findspots.',
  },
  {
    label: 'inserted matches',
    count: 77,
    firstId: -25,
    range: 'Showing 51–75 of 77 mapped findspots.',
  },
])(
  'retains a focused matching link across $label',
  async ({ count, firstId, range }) => {
    const { rerender } = renderPanel(search())
    await nextPage()
    const focusedLink = screen.getAllByRole('link')[5]
    act(() => focusedLink.focus())
    expect(focusedLink).toHaveAttribute('href', '/library/search?findspotId=30')

    rerender(panel(search(count, firstId)))

    const matchingLink = screen
      .getAllByRole('link')
      .find(
        (link) => link.getAttribute('href') === '/library/search?findspotId=30',
      )
    expect(matchingLink).toBe(focusedLink)
    expect(focusedLink).toHaveFocus()
    expect(screen.getByText(range)).toBeVisible()

    rerender(panel(search(count, firstId)))
    expect(focusedLink).toHaveFocus()
  },
)

it('forgets a focused match that disappears before it returns', async () => {
  const { rerender } = renderPanel(search())
  await nextPage()
  const focusedLink = screen.getAllByRole('link')[5]
  act(() => focusedLink.focus())

  rerender(panel(search(26, 100)))
  expect(screen.getByText('Showing 1–25 of 26 mapped findspots.')).toBeVisible()
  expect(focusedLink).not.toBeInTheDocument()

  rerender(panel(search(102)))
  expect(
    screen.getByText('Showing 1–25 of 102 mapped findspots.'),
  ).toBeVisible()
})
