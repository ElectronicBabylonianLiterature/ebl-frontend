import React from 'react'
import classNames from 'classnames'

interface ToggleProps {
  show: boolean
  controls: string
  visible: boolean
  onToggle: () => void
}

function ToggleCell({
  show,
  controls,
  visible,
  onToggle,
  label,
  iconClasses,
}: ToggleProps & {
  label: string
  iconClasses: Record<string, boolean>
}): JSX.Element {
  return (
    <td className="chapter-display__toggle" onClick={onToggle}>
      {visible && (
        <i
          className={classNames({ fas: true, ...iconClasses })}
          aria-expanded={show}
          aria-controls={controls}
          aria-label={label}
          role="button"
        ></i>
      )}
    </td>
  )
}

export function ScoreToggle(props: ToggleProps): JSX.Element {
  return (
    <ToggleCell
      {...props}
      label="Show score"
      iconClasses={{
        'fa-caret-right': !props.show,
        'fa-caret-down': props.show,
      }}
    />
  )
}

export function NotesToggle(props: ToggleProps): JSX.Element {
  return (
    <ToggleCell
      {...props}
      label="Show notes"
      iconClasses={{ 'fa-book': !props.show, 'fa-book-open': props.show }}
    />
  )
}

export function ParallelsToggle(props: ToggleProps): JSX.Element {
  return (
    <ToggleCell
      {...props}
      label="Show parallels"
      iconClasses={{ 'fa-quote-right': true }}
    />
  )
}
