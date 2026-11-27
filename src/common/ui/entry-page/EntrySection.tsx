import React from 'react'
import classNames from 'classnames'
import { Collapse } from 'react-bootstrap'
import { sectionContentId } from 'common/ui/entry-page/entryNavSections'

export function EntrySection({
  id,
  heading,
  open,
  onToggle,
  collapsible = true,
  children,
}: {
  id: string
  heading: React.ReactNode
  open: boolean
  onToggle: (id: string) => void
  collapsible?: boolean
  children: React.ReactNode
}): JSX.Element {
  if (!collapsible) {
    return (
      <section
        id={id}
        className="EntryPage__section"
        aria-labelledby={`${id}-heading`}
      >
        <h2 id={`${id}-heading`} className="EntryPage__section-heading">
          {heading}
        </h2>
        {children}
      </section>
    )
  }
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
          aria-controls={sectionContentId(id)}
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
        <div id={sectionContentId(id)}>{children}</div>
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
      {React.Children.toArray(children)
        .filter((item) => item !== '')
        .map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && ' '}
            {item}
          </React.Fragment>
        ))}
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
      {children}
    </span>
  )
}
