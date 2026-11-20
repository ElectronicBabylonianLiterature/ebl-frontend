import React, { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import MapStage from 'map/ui/MapStage'

describe('MapStage', () => {
  it('renders the map container with its accessible attributes', () => {
    const containerRef = createRef<HTMLDivElement>()
    render(
      <MapStage
        containerRef={containerRef}
        isBackgroundUnavailable={false}
        describedById="findspot-map-description"
      />,
    )

    const region = screen.getByRole('region', {
      name: 'Interactive findspot map',
    })
    expect(region).toHaveAttribute(
      'aria-describedby',
      'findspot-map-description',
    )
    expect(containerRef.current).toBe(region)
  })

  it('does not show the background-unavailable warning by default', () => {
    const containerRef = createRef<HTMLDivElement>()
    render(
      <MapStage containerRef={containerRef} isBackgroundUnavailable={false} />,
    )

    expect(
      screen.queryByText(/map background is unavailable/i),
    ).not.toBeInTheDocument()
  })

  it('shows a warning when the map background is unavailable', () => {
    const containerRef = createRef<HTMLDivElement>()
    render(
      <MapStage containerRef={containerRef} isBackgroundUnavailable={true} />,
    )

    expect(
      screen.getByText(/map background is unavailable/i),
    ).toBeInTheDocument()
  })

  it('only advertises fallback links when they are rendered', () => {
    const containerRef = createRef<HTMLDivElement>()
    const { rerender } = render(
      <MapStage
        containerRef={containerRef}
        isBackgroundUnavailable
        showFallbackHint
      />,
    )
    expect(
      screen.getByText(/You can still browse sites and use Library links/),
    ).toBeInTheDocument()

    rerender(<MapStage containerRef={containerRef} isBackgroundUnavailable />)
    expect(
      screen.queryByText(/You can still browse sites and use Library links/),
    ).not.toBeInTheDocument()
  })

  it('renders the overlay when provided', () => {
    const containerRef = createRef<HTMLDivElement>()
    render(
      <MapStage
        containerRef={containerRef}
        isBackgroundUnavailable={false}
        overlay={<div>Loading overlay</div>}
      />,
    )

    expect(screen.getByText('Loading overlay')).toBeInTheDocument()
  })
})
