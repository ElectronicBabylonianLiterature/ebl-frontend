import React from 'react'
import type { FindspotSummary } from './mapResearchSummary'
import type { PolygonResearchSummary } from './mapResearchSummary'
import {
  MAPPING_PROVENANCE_NOTE,
  locationPrecisionLabel,
  mappingEvidenceLabel,
} from './mapResearchLabels'

interface Row {
  readonly label: string
  readonly value: string
}

const CONTEXT_FIELDS: readonly {
  readonly label: string
  readonly key: keyof Pick<
    FindspotSummary,
    'sector' | 'area' | 'building' | 'room'
  >
}[] = [
  { label: 'Sector', key: 'sector' },
  { label: 'Area', key: 'area' },
  { label: 'Building', key: 'building' },
  { label: 'Room', key: 'room' },
]

function distinctValues(
  findspots: readonly FindspotSummary[],
  key: (typeof CONTEXT_FIELDS)[number]['key'],
): readonly string[] {
  return [
    ...new Set(
      findspots.flatMap((findspot) => {
        const value = findspot[key]
        return value === null || value.trim() === '' ? [] : [value]
      }),
    ),
  ].sort()
}

/**
 * Only rows the response actually carries are rendered. An absent optional
 * field is simply not a row — repeating "source unavailable" for each one
 * would read as missing data rather than as data the API does not expose.
 */
export function evidenceRows(summary: PolygonResearchSummary): readonly Row[] {
  const methods = [
    ...new Set(summary.findspots.map((findspot) => findspot.matchMethod)),
  ].sort()

  return [
    ...(summary.mappedFindspotCount === 0
      ? []
      : [
          {
            label: 'Mapping method',
            value: methods.map(mappingEvidenceLabel).join(', '),
          },
          {
            label: 'Location precision',
            value: locationPrecisionLabel(summary.locationPrecision),
          },
        ]),
    ...(summary.areaSquareKm === null
      ? []
      : [
          {
            label: 'Mapped area',
            value: `${summary.areaSquareKm.toFixed(3)} km²`,
          },
        ]),
    ...CONTEXT_FIELDS.flatMap(({ label, key }) => {
      const values = distinctValues(summary.findspots, key)
      return values.length === 0 ? [] : [{ label, value: values.join(', ') }]
    }),
  ]
}

export default function MapInspectorEvidence({
  summary,
}: {
  readonly summary: PolygonResearchSummary
}): JSX.Element {
  const rows = evidenceRows(summary)

  return (
    <div className="map-inspector__evidence">
      {rows.length === 0 ? (
        <p>No mapping evidence is recorded for this excavation area.</p>
      ) : (
        <dl className="map-inspector__definitions">
          {rows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="map-inspector__footnote">{MAPPING_PROVENANCE_NOTE}</p>
    </div>
  )
}
