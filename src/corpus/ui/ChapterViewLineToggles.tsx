import React, { PropsWithChildren } from 'react'

export function ToggleCell({
  onToggle,
  children,
}: PropsWithChildren<{ onToggle: () => void }>): JSX.Element {
  return (
    <td className="chapter-display__toggle" onClick={onToggle}>
      {children}
    </td>
  )
}

export function ToggleIcon({
  className,
  expanded,
  controls,
  label,
}: {
  className: string
  expanded: boolean
  controls: string
  label: string
}): JSX.Element {
  return (
    <i
      className={className}
      aria-expanded={expanded}
      aria-controls={controls}
      aria-label={label}
      role="button"
    ></i>
  )
}
