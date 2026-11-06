import React, { useEffect, useRef } from 'react'
import { Button } from 'react-bootstrap'

interface Props {
  readonly onExit: () => void
}
export default function MapPresentationBar({ onExit }: Props): JSX.Element {
  const exitRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    exitRef.current?.focus()
  }, [])

  return (
    <div className="map-presentation-bar">
      <Button
        ref={exitRef}
        type="button"
        size="sm"
        variant="secondary"
        onClick={onExit}
      >
        Exit presentation mode
      </Button>
    </div>
  )
}
