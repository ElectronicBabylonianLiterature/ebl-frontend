import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import { LineOutline } from 'corpus/application/edit-lite/chapterOutline'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import LineMoveDialog from 'corpus/ui/edit-lite/LineMoveDialog'
import { LineActivity } from 'corpus/ui/edit-lite/lineStates'
import 'corpus/ui/edit-lite/SplitLines.sass'

interface Props {
  readonly lines: readonly LineOutline[]
  readonly index: number
  readonly isLoaded: boolean
  readonly activity: LineActivity
  readonly onMoved: (from: number, to: number) => void
}

type ButtonClick = React.MouseEvent<HTMLButtonElement>

function isFocusLost(starter: HTMLButtonElement): boolean {
  const focusedElement = document.activeElement
  return focusedElement === document.body || focusedElement === starter
}

function useFocusRestoring(
  isEnabled: boolean,
  fallbackRef: React.RefObject<HTMLButtonElement>,
): (starter: HTMLButtonElement) => void {
  const starterRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const starter = starterRef.current
    if (isEnabled && starter !== null) {
      starterRef.current = null
      if (isFocusLost(starter)) {
        const target = starter.disabled ? fallbackRef.current : starter
        target?.focus()
      }
    }
  }, [isEnabled, fallbackRef])

  return (starter: HTMLButtonElement): void => {
    starterRef.current = starter
  }
}

export default function LineMoveControls({
  lines,
  index,
  isLoaded,
  activity,
  onMoved,
}: Props): JSX.Element | null {
  const { actions, canWrite } = useEditLiteContext()
  const [chooser, setChooser] = useState<HTMLButtonElement | null>(null)
  const chooserRef = useRef<HTMLButtonElement>(null)
  const canMove = isLoaded && activity === 'idle'
  const restoreFocusTo = useFocusRestoring(canMove, chooserRef)
  const lastIndex = lines.length - 1
  const moveTo = (to: number, starter: HTMLButtonElement): void => {
    setChooser(null)
    restoreFocusTo(starter)
    actions.moveLine(index, to, (): void => onMoved(index, to))
  }

  return canWrite ? (
    <>
      <div
        className="edit-lite-split__move"
        role="group"
        aria-label="Move line"
      >
        <Button
          size="sm"
          variant="outline-secondary"
          disabled={!canMove || index <= 0}
          onClick={(event: ButtonClick): void =>
            moveTo(index - 1, event.currentTarget)
          }
        >
          Move up
        </Button>
        <Button
          size="sm"
          variant="outline-secondary"
          disabled={!canMove || index >= lastIndex}
          onClick={(event: ButtonClick): void =>
            moveTo(index + 1, event.currentTarget)
          }
        >
          Move down
        </Button>
        <Button
          ref={chooserRef}
          size="sm"
          variant="outline-secondary"
          disabled={!canMove || lastIndex <= 0}
          onClick={(event: ButtonClick): void =>
            setChooser(event.currentTarget)
          }
        >
          Move to...
        </Button>
      </div>
      {chooser !== null && (
        <LineMoveDialog
          lines={lines}
          index={index}
          onMove={(to: number): void => moveTo(to, chooser)}
          onCancel={(): void => setChooser(null)}
        />
      )}
    </>
  ) : null
}
