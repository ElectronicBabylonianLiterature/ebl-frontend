import React from 'react'
import { render, screen } from '@testing-library/react'
import MapLegendList from 'map/ui/MapLegendList'

it('draws an entry outline in its own colour when one is given', () => {
  render(
    <MapLegendList
      label="Mapped status"
      entries={[
        { key: 'plain', label: 'Plain', color: '#112233', pattern: 'solid' },
        {
          key: 'selected',
          label: 'Selected',
          color: '#112233',
          pattern: 'solid',
          outlineColor: '#445566',
          outlineWidth: 3,
        },
      ]}
    />,
  )
  const [plain, selected] = screen.getAllByTestId('map-legend-mark')
  expect(plain).toHaveStyle({ borderColor: '#112233' })
  expect(selected).toHaveStyle({ borderColor: '#445566', borderWidth: '3px' })
})
