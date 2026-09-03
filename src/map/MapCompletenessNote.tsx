import React, { useState } from 'react'
import { EXCAVATION_AREA_NOTE, FRAGMENT_ACCESS_NOTE } from './mapResearchLabels'

/**
 * The precision caveat, as an expandable disclosure rather than a paragraph
 * laid over the map. It appears wherever counts are shown, so a reader never
 * meets a fragment total without the sentence that qualifies it being one
 * click away.
 */
export default function MapCompletenessNote(): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="map-precision-note">
      <button
        type="button"
        className="map-precision-note__toggle"
        aria-expanded={isExpanded}
        aria-controls="map-precision-note-body"
        onClick={() => setIsExpanded((current) => !current)}
      >
        How to read these counts
      </button>
      {isExpanded ? (
        <p id="map-precision-note-body" className="map-precision-note__body">
          {FRAGMENT_ACCESS_NOTE} {EXCAVATION_AREA_NOTE}
        </p>
      ) : null}
    </div>
  )
}
