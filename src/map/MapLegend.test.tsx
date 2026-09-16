import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapLegend from './MapLegend'
import { buildChoroplethLegend } from './mapChoroplethScale'

const evidenceLegend = buildChoroplethLegend('evidence', null, [])

describe('MapLegend', () => {
  it('starts collapsed', () => {
    render(<MapLegend mode="evidence" legend={evidenceLegend} />)

    expect(screen.getByRole('button', { name: 'Legend' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.queryByLabelText('Map legend')).not.toBeInTheDocument()
  })

  it('expands to the evidence classes and collapses again', async () => {
    render(<MapLegend mode="evidence" legend={evidenceLegend} />)
    const toggle = screen.getByRole('button', { name: 'Legend' })

    await userEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const body = screen.getByLabelText('Map legend')
    expect(body).toHaveTextContent('No mapped findspot')
    expect(body).toHaveTextContent('Verified-source mapping')
    expect(body).toHaveTextContent('Curated mapping')
    expect(body).toHaveTextContent('Mixed mapping evidence')
    expect(body).toHaveTextContent('Selected area')

    await userEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByLabelText('Map legend')).not.toBeInTheDocument()
  })

  it('follows the visualization mode', async () => {
    render(
      <MapLegend
        mode="mapped"
        legend={buildChoroplethLegend('mapped', null, [])}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Legend' }))

    const body = screen.getByLabelText('Map legend')
    expect(body).toHaveTextContent('Mapped with accessible fragments')
    expect(body).not.toHaveTextContent('Curated mapping')
  })
})
