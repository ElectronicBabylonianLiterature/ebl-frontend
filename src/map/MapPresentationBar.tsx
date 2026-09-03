import React, { useEffect, useRef } from 'react'
import { Button } from 'react-bootstrap'

interface Props {
  readonly title: string | null
  readonly onExit: () => void
}

/**
 * The only chrome presentation mode leaves behind: what is selected, and the
 * way out. Focus moves to the exit control on entry so the mode is never a
 * place a keyboard user can be stranded.
 */
export default function MapPresentationBar({
  title,
  onExit,
}: Props): JSX.Element {
  const exitRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    exitRef.current?.focus()
  }, [])

  return (
    <div className="map-presentation-bar">
      {title === null ? null : (
        <strong className="map-presentation-bar__title">{title}</strong>
      )}
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
