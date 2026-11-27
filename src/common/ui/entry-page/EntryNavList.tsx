import React from 'react'
import classNames from 'classnames'
import { Collapse } from 'react-bootstrap'
import {
  EntryNavSection,
  sectionContentId,
} from 'common/ui/entry-page/entryNavSections'

function navSublistId(sectionId: string): string {
  return `${sectionId}-nav-sublist`
}

function toggleTargets(section: EntryNavSection): string {
  return [
    sectionContentId(section.id),
    ...(section.subsections.length > 0 ? [navSublistId(section.id)] : []),
  ].join(' ')
}

interface NavigationState {
  activeId: string | null
  selectedId: string | null
  onNavigate: (id: string) => void
}

export function NavAnchor({
  id,
  className,
  activeId,
  selectedId,
  onNavigate,
  children,
}: NavigationState & {
  id: string
  className: string
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

function SectionToggle({
  section,
  open,
  onToggleSection,
}: {
  section: EntryNavSection
  open: boolean
  onToggleSection: (id: string) => void
}): JSX.Element {
  if (section.collapsible === false) {
    return <span className="EntryPage__nav-toggle" aria-hidden="true" />
  }
  return (
    <button
      type="button"
      className="EntryPage__nav-toggle"
      aria-expanded={open}
      aria-controls={toggleTargets(section)}
      aria-label={`${open ? 'Collapse' : 'Expand'} ${section.label}`}
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
  )
}

function NavSubsections({
  section,
  open,
  ...navigation
}: NavigationState & {
  section: EntryNavSection
  open: boolean
}): JSX.Element {
  return (
    <Collapse in={open}>
      <ul id={navSublistId(section.id)} className="EntryPage__nav-sublist">
        {section.subsections.map((subsection) => (
          <li key={subsection.id} className="EntryPage__nav-subitem">
            <NavAnchor
              id={subsection.id}
              className="EntryPage__nav-sublink"
              {...navigation}
            >
              {subsection.label}
            </NavAnchor>
          </li>
        ))}
      </ul>
    </Collapse>
  )
}

export default function EntryNavList({
  sections,
  openSections,
  onToggleSection,
  ...navigation
}: NavigationState & {
  sections: readonly EntryNavSection[]
  openSections: Readonly<Record<string, boolean>>
  onToggleSection: (id: string) => void
}): JSX.Element {
  return (
    <ul className="EntryPage__nav-list">
      {sections.map((section) => {
        const open = openSections[section.id]
        const isActiveGroup =
          navigation.activeId === section.id ||
          section.subsections.some(
            (subsection) => subsection.id === navigation.activeId,
          )
        return (
          <li
            key={section.id}
            className={classNames('EntryPage__nav-item', {
              'is-active-group': isActiveGroup,
            })}
          >
            <div className="EntryPage__nav-row">
              <SectionToggle
                section={section}
                open={open}
                onToggleSection={onToggleSection}
              />
              <NavAnchor
                id={section.id}
                className="EntryPage__nav-link"
                {...navigation}
              >
                {section.label}
              </NavAnchor>
            </div>
            {section.subsections.length > 0 && (
              <NavSubsections section={section} open={open} {...navigation} />
            )}
          </li>
        )
      })}
    </ul>
  )
}
