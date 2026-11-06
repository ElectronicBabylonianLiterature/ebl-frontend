import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapInspectorTabs, { type InspectorTab } from 'map/MapInspectorTabs'

const tabs: readonly InspectorTab[] = [
  { id: 'a', label: 'Overview', render: () => <p>overview body</p> },
  { id: 'b', label: 'Evidence', render: () => <p>evidence body</p> },
]

describe('MapInspectorTabs', () => {
  it('renders the first tab panel by default', () => {
    render(<MapInspectorTabs tabs={tabs} label="Detail" />)
    expect(screen.getByText('overview body')).toBeInTheDocument()
  })

  it('switches panels when a tab is clicked', async () => {
    render(<MapInspectorTabs tabs={tabs} label="Detail" />)
    await userEvent.click(screen.getByRole('tab', { name: 'Evidence' }))
    expect(screen.getByText('evidence body')).toBeInTheDocument()
  })

  it('moves between tabs with the arrow keys', async () => {
    render(<MapInspectorTabs tabs={tabs} label="Detail" />)
    screen.getByRole('tab', { name: 'Overview' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Evidence' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })
})

it('keeps inactive controls valid and handles backwards wrapping, Home and End', async () => {
  render(<MapInspectorTabs tabs={tabs} label="Detail" />)
  const overview = screen.getByRole('tab', { name: 'Overview' })
  const evidence = screen.getByRole('tab', { name: 'Evidence' })
  expect(evidence).not.toHaveAttribute('aria-controls')
  expect(overview).toHaveAttribute(
    'aria-controls',
    screen.getByRole('tabpanel').getAttribute('id'),
  )
  overview.focus()
  await userEvent.keyboard('{ArrowLeft}')
  expect(evidence).toHaveFocus()
  await userEvent.keyboard('{Home}')
  expect(overview).toHaveFocus()
  await userEvent.keyboard('{End}')
  expect(evidence).toHaveFocus()
  await userEvent.keyboard('{ArrowRight}')
  expect(overview).toHaveFocus()
})
