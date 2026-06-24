import React from 'react'
import classNames from 'classnames'
import { Collapse } from 'react-bootstrap'
import { RealiaNavSection } from 'realia/ui/realiaSections'

interface Props {
  title: string
  typeLabel: string | null
  topId: string
  sections: readonly RealiaNavSection[]
  openSections: Readonly<Record<string, boolean>>
  activeId: string | null
  onToggleSection: (id: string) => void
  onNavigate: (id: string, sectionId: string) => void
}

function NavSubsections({
  section,
  open,
  activeId,
  onNavigate,
}: {
  section: RealiaNavSection
  open: boolean
  activeId: string | null
  onNavigate: (id: string, sectionId: string) => void
}): JSX.Element {
  return (
    <Collapse in={open}>
      <ul className="Realia__nav-sublist">
        {section.subsections.map((subsection) => (
          <li key={subsection.id} className="Realia__nav-subitem">
            <a
              href={`#${subsection.id}`}
              className={classNames('Realia__nav-sublink', {
                'is-active': activeId === subsection.id,
              })}
              aria-current={activeId === subsection.id ? 'true' : undefined}
              onClick={(event): void => {
                event.preventDefault()
                onNavigate(subsection.id, section.id)
              }}
            >
              {subsection.label}
            </a>
          </li>
        ))}
      </ul>
    </Collapse>
  )
}

export default function RealiaNavMenu({
  title,
  typeLabel,
  topId,
  sections,
  openSections,
  activeId,
  onToggleSection,
  onNavigate,
}: Props): JSX.Element {
  return (
    <nav className="Realia__nav" aria-label="On this page">
      <a
        href={`#${topId}`}
        className={classNames('Realia__nav-top', {
          'is-active': activeId === topId,
        })}
        aria-current={activeId === topId ? 'true' : undefined}
        onClick={(event): void => {
          event.preventDefault()
          onNavigate(topId, topId)
        }}
      >
        <span className="Realia__nav-top-title">{title}</span>
        {typeLabel && <span className="Realia__nav-top-type">{typeLabel}</span>}
      </a>
      <ul className="Realia__nav-list">
        {sections.map((section) => {
          const open = openSections[section.id]
          const isActiveGroup =
            activeId === section.id ||
            section.subsections.some((subsection) => subsection.id === activeId)
          return (
            <li
              key={section.id}
              className={classNames('Realia__nav-item', {
                'is-active-group': isActiveGroup,
              })}
            >
              <div className="Realia__nav-row">
                <button
                  type="button"
                  className="Realia__nav-toggle"
                  aria-expanded={open}
                  aria-label={`${open ? 'Collapse' : 'Expand'} ${
                    section.label
                  }`}
                  onClick={(): void => onToggleSection(section.id)}
                >
                  <i
                    className={classNames('fas', {
                      'fa-caret-down': open,
                      'fa-caret-right': !open,
                    })}
                    aria-hidden="true"
                  />
                </button>
                <a
                  href={`#${section.id}`}
                  className={classNames('Realia__nav-link', {
                    'is-active': activeId === section.id,
                  })}
                  aria-current={activeId === section.id ? 'true' : undefined}
                  onClick={(event): void => {
                    event.preventDefault()
                    onNavigate(section.id, section.id)
                  }}
                >
                  {section.label}
                </a>
              </div>
              {section.subsections.length > 0 && (
                <NavSubsections
                  section={section}
                  open={open}
                  activeId={activeId}
                  onNavigate={onNavigate}
                />
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
