import React, { useState } from 'react'
import { EXCAVATION_AREA_NOTE, FRAGMENT_ACCESS_NOTE } from './mapResearchLabels'
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
