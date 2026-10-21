import React from 'react'
import classNames from 'classnames'
import { Collapse } from 'react-bootstrap'

export function EntrySection({
  id,
  heading,
  open,
  onToggle,
  children,
}: {
  id: string
  heading: React.ReactNode
  open: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
}): JSX.Element {
  return (
    <section
      id={id}
      className="EntryPage__section"
      aria-labelledby={`${id}-heading`}
    >
      <h2 id={`${id}-heading`} className="EntryPage__section-heading">
        <button
          type="button"
          className="EntryPage__section-toggle"
          aria-expanded={open}
          onClick={(): void => onToggle(id)}
        >
          <i
            className={classNames('fas', 'EntryPage__section-caret', {
              'fa-caret-down': open,
              'fa-caret-right': !open,
            })}
            aria-hidden="true"
          />
          {heading}
        </button>
      </h2>
      <Collapse in={open}>
        <div>{children}</div>
      </Collapse>
    </section>
  )
}

export function EntryMetadata({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <div
      className="EntryPage__metadata"
      role="group"
      aria-label="Entry details"
    >
      {children}
    </div>
  )
}

export function EntryMetadataItem({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <span>
      <span className="EntryPage__metadata-label">{label}: </span>
      {children}{' '}
    </span>
  )
}
