import React from 'react'
import type { MapElevationProfile } from './useMapElevationProfile'
import {
  ELEVATION_PROFILE_NOTE,
  ELEVATION_PROFILE_TITLE,
  type ElevationProfile,
  formatElevation,
} from './mapElevationProfile'
import MapElevationProfileChart from './MapElevationProfileChart'

const STATUS_MESSAGES: Readonly<Record<string, string>> = {
  empty: 'Measure a distance on the map to read its modern elevation profile.',
  'terrain-unavailable':
    'Turn on the modern elevation model to read an elevation profile.',
  unsupported: 'The active terrain model returned no elevation for this line.',
}

function Metrics({
  profile,
}: {
  readonly profile: ElevationProfile
}): JSX.Element {
  return (
    <dl className="map-elevation__metrics">
      {[
        ['Minimum', formatElevation(profile.minElevationMetres)],
        ['Maximum', formatElevation(profile.maxElevationMetres)],
        ['Start', formatElevation(profile.startElevationMetres)],
        ['End', formatElevation(profile.endElevationMetres)],
        ['Total ascent', formatElevation(profile.totalAscentMetres)],
        ['Total descent', formatElevation(profile.totalDescentMetres)],
      ].map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
export default function MapElevationProfilePanel({
  elevation,
}: {
  readonly elevation: MapElevationProfile
}): JSX.Element {
  return (
    <section className="map-elevation" aria-label={ELEVATION_PROFILE_TITLE}>
      <h3 className="map-elevation__title">{ELEVATION_PROFILE_TITLE}</h3>
      {elevation.profile === null ? (
        <p className="map-tool-panel__status" role="status">
          {STATUS_MESSAGES[elevation.status]}
        </p>
      ) : (
        <>
          <MapElevationProfileChart profile={elevation.profile} />
          <Metrics profile={elevation.profile} />
          <p className="map-elevation__samples">
            {`${elevation.sampleCount} samples along ${Math.round(
              elevation.profile.distanceMetres,
            ).toLocaleString('en')} m`}
          </p>
        </>
      )}
      <p className="map-tool-panel__note">{ELEVATION_PROFILE_NOTE}</p>
    </section>
  )
}
