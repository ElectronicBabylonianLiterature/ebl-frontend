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
  selectedId: string | null
  onToggleSection: (id: string) => void
  onNavigate: (id: string) => void
}

function NavAnchor({
  id,
  className,
  activeId,
  selectedId,
  onNavigate,
  children,
}: {
  id: string
  className: string
  activeId: string | null
  selectedId: string | null
  onNavigate: (id: string) => void
  children: React.ReactNode
}): JSX.Element {
  return (
    <a
      href={`#${id}`}
      className={classNames(className, {
        'is-active': activeId === id,
        'is-selected': selectedId === id,
      })}
      aria-current={activeId === id ? 'true' : undefined}
      onClick={(event): void => {
        event.preventDefault()
        onNavigate(id)
      }}
    >
      {children}
    </a>
  )
}

function NavSubsections({
  section,
  open,
  activeId,
  selectedId,
  onNavigate,
}: {
  section: RealiaNavSection
  open: boolean
  activeId: string | null
  selectedId: string | null
  onNavigate: (id: string) => void
}): JSX.Element {
  return (
    <Collapse in={open}>
      <ul className="Realia__nav-sublist">
        {section.subsections.map((subsection) => (
          <li key={subsection.id} className="Realia__nav-subitem">
            <NavAnchor
              id={subsection.id}
              className="Realia__nav-sublink"
              activeId={activeId}
              selectedId={selectedId}
              onNavigate={onNavigate}
            >
              {subsection.label}
            </NavAnchor>
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
  selectedId,
  onToggleSection,
  onNavigate,
}: Props): JSX.Element {
  return (
    <nav className="Realia__nav" aria-label="On this page">
      <NavAnchor
        id={topId}
        className="Realia__nav-top"
        activeId={activeId}
        selectedId={selectedId}
        onNavigate={onNavigate}
      >
        <span className="Realia__nav-top-title">{title}</span>
        {typeLabel && <span className="Realia__nav-top-type">{typeLabel}</span>}
      </NavAnchor>
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
                <NavAnchor
                  id={section.id}
                  className="Realia__nav-link"
                  activeId={activeId}
                  selectedId={selectedId}
                  onNavigate={onNavigate}
                >
                  {section.label}
                </NavAnchor>
              </div>
              {section.subsections.length > 0 && (
                <NavSubsections
                  section={section}
                  open={open}
                  activeId={activeId}
                  selectedId={selectedId}
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
