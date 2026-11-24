import React, { useEffect, useId, useRef } from 'react'
import classNames from 'classnames'
import { Button, Overlay, Popover } from 'react-bootstrap'
import { WordFlow } from 'corpus/ui/edit-lite/useWordFlow'
import { focusNextStop, hasOpenMenu } from 'corpus/ui/edit-lite/wordKeys'
import 'corpus/ui/edit-lite/LineViews.sass'

interface Props {
  readonly label: string
  readonly position: number
  readonly flow: WordFlow
  readonly isHighlighted?: boolean
  readonly toggle: React.ReactNode
  readonly children: (close: () => void) => React.ReactNode
}

export default function WordPopover({
  label,
  position,
  flow,
  isHighlighted = false,
  toggle,
  children,
}: Props): JSX.Element {
  const id = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isActive = flow.active === position
  const { close: dismiss } = flow

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent): void => {
      const target = event.target as Node
      const isInside = [buttonRef.current, document.getElementById(id)].some(
        (element) => element?.contains(target),
      )
      if (!isInside) {
        dismiss()
      }
    }
    if (isActive) {
      document.addEventListener('mousedown', handleMouseDown)
    }
    return (): void =>
      document.removeEventListener('mousedown', handleMouseDown)
  }, [isActive, dismiss, id])

  const close = (): void => {
    flow.close()
    buttonRef.current?.focus()
  }
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>): void => {
    if (event.key === 'Escape' && !hasOpenMenu(event.currentTarget)) {
      close()
    } else if (event.key === 'F2') {
      event.preventDefault()
      focusNextStop(event.currentTarget)
    }
  }

  return (
    <>
      <Button
        ref={buttonRef}
        size="sm"
        variant="outline-dark"
        className={classNames({ 'edit-lite-word--pending': isHighlighted })}
        active={isActive}
        aria-haspopup="dialog"
        aria-expanded={isActive}
        aria-controls={isActive ? id : undefined}
        onClick={(): void => (isActive ? close() : flow.activate(position))}
      >
        {toggle}
      </Button>
      {isActive && (
        <Overlay
          target={buttonRef}
          show
          placement="bottom-start"
          flip
          transition={false}
        >
          <Popover
            id={id}
            className="edit-lite-word-popover"
            role="dialog"
            aria-label={label}
            onKeyDown={handleKeyDown}
          >
            <Popover.Body>{children(close)}</Popover.Body>
          </Popover>
        </Overlay>
      )}
    </>
  )
}
