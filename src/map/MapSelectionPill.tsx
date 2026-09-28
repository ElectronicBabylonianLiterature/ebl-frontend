import React from 'react'
import { Button } from 'react-bootstrap'

interface Props {
  readonly label: string
  readonly onShow: () => void
}
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
