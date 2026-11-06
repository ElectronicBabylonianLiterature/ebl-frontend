import { screen } from '@testing-library/react'
import { controller, renderPanel } from 'map/MapSpatialSearchPanel.testSupport'

it.each(['loading', 'unavailable'])(
  'does not invent zero accessible tablets when all matching data is %s',
  (status) => {
    renderPanel(
      controller({
        shape: { type: 'viewport', bounds: [[43, 35, 44, 36]] },
        result: {
          polygonIds: ['a'],
          findspotIds: [],
          mappedPolygonCount: 0,
          accessibleFragmentCount: 0,
          availablePolygonCount: 0,
          loadingPolygonCount: status === 'loading' ? 1 : 0,
          unavailablePolygonCount: status === 'unavailable' ? 1 : 0,
        },
      }),
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Accessible tablet totals are unavailable.',
    )
    expect(screen.getByRole('status')).not.toHaveTextContent(
      '0 accessible tablets',
    )
  },
)
