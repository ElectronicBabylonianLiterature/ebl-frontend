import React from 'react'
import { Link } from 'react-router-dom'
import './AboutInlineLink.sass'

type Props = {
  to: string
  label: string
  className?: string
}

export default function AboutInlineLink({
  to,
  label,
  className = '',
}: Props): JSX.Element {
  const aboutLabel = `Learn more about ${label}`

  return (
    <Link
      to={to}
      className={`AboutInlineLink ${className}`.trim()}
      title={aboutLabel}
      aria-label={aboutLabel}
    >
      <i className="fas fa-info-circle" aria-hidden="true" />
      <span className="visually-hidden">{aboutLabel}</span>
    </Link>
  )
}
