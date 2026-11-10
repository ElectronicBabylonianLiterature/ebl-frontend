import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import MapInspectorTabs from 'map/ui/MapInspectorTabs'

it('keeps ordinary keys available and selects a mounted fallback when tabs change', () => {
  const { rerender } = render(
    <MapInspectorTabs
      label="Evidence"
      tabs={[
        {
          id: 'overview',
          label: 'Overview',
          render: () => <p>Area overview</p>,
        },
      ]}
    />,
  )
  const overview = screen.getByRole('tab', { name: 'Overview' })
  expect(fireEvent.keyDown(overview, { key: 'PageDown' })).toBe(true)
  expect(overview).toHaveAttribute('aria-selected', 'true')

  rerender(
    <MapInspectorTabs
      label="Evidence"
      tabs={[
        {
          id: 'sources',
          label: 'Sources',
          render: () => <p>Source evidence</p>,
        },
      ]}
    />,
  )

  expect(screen.getByRole('tab', { name: 'Sources' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Source evidence')
  expect(screen.getByRole('tab', { name: 'Sources' })).toHaveAttribute(
    'aria-controls',
    screen.getByRole('tabpanel').getAttribute('id'),
  )
})
