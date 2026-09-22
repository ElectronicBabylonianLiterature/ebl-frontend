import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapLegend from 'map/MapLegend'
import {
  buildChoroplethLegend,
  buildChoroplethScale,
} from 'map/mapChoroplethScale'

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
    expect(body).toHaveTextContent(
      'Linked fragment data unavailable or loading',
    )
    expect(body).toHaveTextContent('No mapped findspot')
    expect(body).toHaveTextContent('Verified-source mapping')
    expect(body).toHaveTextContent('Curated mapping')
    expect(body).toHaveTextContent('Mixed mapping evidence')
    expect(body).toHaveTextContent('Selected area')
    const marks = within(body).getAllByTestId('map-legend-mark')
    expect(
      marks.some((mark) => mark.classList.contains('map-legend__mark--dashed')),
    ).toBe(true)
    expect(
      marks.some((mark) =>
        mark.classList.contains('map-legend__mark--dash-dot'),
      ),
    ).toBe(true)

    await userEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByLabelText('Map legend')).not.toBeInTheDocument()
  })

  it('shows the numeric outline-width encoding', async () => {
    const values = [1, 4, 9, 30]
    const scale = buildChoroplethScale('count', values)
    render(
      <MapLegend
        mode="count"
        legend={buildChoroplethLegend('count', scale, values)}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Legend' }))

    const marks = within(screen.getByLabelText('Map legend')).getAllByTestId(
      'map-legend-mark',
    )
    expect(marks.map((mark) => mark.style.borderWidth).filter(Boolean)).toEqual(
      ['1.2px', '1.9px', '2.6px', '3.3px'],
    )
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
