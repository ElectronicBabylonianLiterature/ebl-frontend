import React from 'react'
import { Button } from 'react-bootstrap'

interface Props {
  readonly label: string
  readonly onShow: () => void
}

/**
 * A compact restore control for when a feature is selected but its inspector
 * panel has been dismissed — recovers the detail view without forcing the
 * user to clear the selection just to get map space back.
 */
export default function MapSelectionPill({
  label,
  onShow,
}: Props): JSX.Element {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline-primary"
      className="map-selection-pill"
      onClick={onShow}
    >
      {label}
    </Button>
  )
}
