import React, { useId } from 'react'
import type { ElevationProfile } from './mapElevationProfile'
import { formatElevation } from './mapElevationProfile'

const VIEWBOX_WIDTH = 320
const VIEWBOX_HEIGHT = 96

interface Props {
  readonly profile: ElevationProfile
}

function pathFor(profile: ElevationProfile): string {
  const span = profile.maxElevationMetres - profile.minElevationMetres || 1
  const distance = profile.distanceMetres || 1

  return profile.samples
    .flatMap((sample) => {
      if (sample.elevationMetres === null) return []

      const x = (sample.distanceMetres / distance) * VIEWBOX_WIDTH
      const y =
        VIEWBOX_HEIGHT -
        ((sample.elevationMetres - profile.minElevationMetres) / span) *
          VIEWBOX_HEIGHT
      return [`${x.toFixed(2)},${y.toFixed(2)}`]
    })
    .join(' ')
}

/**
 * A hand-drawn SVG rather than a charting dependency: the shape is one
 * polyline, and everything the chart says is also stated in the accessible
 * description, so the figures never depend on reading the picture.
 */
export default function MapElevationProfileChart({
  profile,
}: Props): JSX.Element {
  const titleId = useId()
  const descriptionId = useId()
  const points = pathFor(profile)

  return (
    <svg
      className="map-elevation-chart"
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="none"
      role="img"
      aria-labelledby={`${titleId} ${descriptionId}`}
    >
      <title id={titleId}>Modern elevation profile</title>
      <desc id={descriptionId}>
        {`Elevation from ${formatElevation(
          profile.startElevationMetres,
        )} to ${formatElevation(profile.endElevationMetres)}, ranging between ${formatElevation(
          profile.minElevationMetres,
        )} and ${formatElevation(profile.maxElevationMetres)} over ${Math.round(
          profile.distanceMetres,
        ).toLocaleString('en')} metres.`}
      </desc>
      <polyline
        className="map-elevation-chart__baseline"
        points={`0,${VIEWBOX_HEIGHT} ${VIEWBOX_WIDTH},${VIEWBOX_HEIGHT}`}
      />
      <polyline className="map-elevation-chart__line" points={points} />
    </svg>
  )
}
