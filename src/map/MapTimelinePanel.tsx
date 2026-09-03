import React from 'react'
import { Button, Form } from 'react-bootstrap'
import type { DatedOverlay } from './overlayPublicationDates'
import { publicationYearExtent } from './overlayPublicationDates'
import {
  DEFAULT_TIMELINE_STATE,
  type PublicationTimelineState,
  timelineSummary,
} from './overlayTimelineFilter'

interface Props {
  readonly dated: readonly DatedOverlay[]
  readonly timeline: PublicationTimelineState
  readonly onChange: (timeline: PublicationTimelineState) => void
}

function parseYearInput(value: string): number | null {
  const year = Number(value)
  return value.trim() === '' || !Number.isInteger(year) ? null : year
}

export default function MapTimelinePanel({
  dated,
  timeline,
  onChange,
}: Props): JSX.Element {
  const extent = publicationYearExtent(dated)

  if (extent === null) {
    return (
      <div className="map-tool-panel">
        <p role="status">
          No historical map in this catalogue carries an established publication
          date, so the timeline cannot filter anything.
        </p>
      </div>
    )
  }

  return (
    <div className="map-tool-panel">
      <p className="map-tool-panel__note">
        Historical map publication date. This is the date of the publication the
        plan appears in, not an archaeological chronology.
      </p>
      <Form.Group controlId="map-timeline-start">
        <Form.Label>Published from</Form.Label>
        <Form.Control
          type="number"
          min={extent.earliestYear}
          max={extent.latestYear}
          value={timeline.startYear ?? ''}
          placeholder={String(extent.earliestYear)}
          onChange={(event) =>
            onChange({
              ...timeline,
              startYear: parseYearInput(event.target.value),
            })
          }
        />
      </Form.Group>
      <Form.Group controlId="map-timeline-end">
        <Form.Label>Published to</Form.Label>
        <Form.Control
          type="number"
          min={extent.earliestYear}
          max={extent.latestYear}
          value={timeline.endYear ?? ''}
          placeholder={String(extent.latestYear)}
          onChange={(event) =>
            onChange({
              ...timeline,
              endYear: parseYearInput(event.target.value),
            })
          }
        />
      </Form.Group>
      <Form.Check
        type="checkbox"
        id="map-timeline-undated"
        label="Include maps without an established publication date"
        checked={timeline.includeUndated}
        onChange={(event) =>
          onChange({ ...timeline, includeUndated: event.target.checked })
        }
      />
      <p className="map-tool-panel__status" role="status">
        {timelineSummary(dated, timeline)}
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline-secondary"
        onClick={() => onChange(DEFAULT_TIMELINE_STATE)}
      >
        Reset timeline
      </Button>
    </div>
  )
}
