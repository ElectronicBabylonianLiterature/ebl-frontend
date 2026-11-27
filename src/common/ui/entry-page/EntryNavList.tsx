import React from 'react'
import classNames from 'classnames'
import { Collapse } from 'react-bootstrap'
import { EntryNavSection } from 'common/ui/entry-page/entryNavSections'

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
  classPrefix,
  section,
  open,
  onToggleSection,
}: {
  classPrefix: string
  section: EntryNavSection
  open: boolean
  onToggleSection: (id: string) => void
}): JSX.Element {
  if (section.collapsible === false) {
    return <span className={`${classPrefix}__nav-toggle`} aria-hidden="true" />
  }
  return (
    <button
      type="button"
      className={`${classPrefix}__nav-toggle`}
      aria-expanded={open}
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
  classPrefix,
  section,
  open,
  ...navigation
}: NavigationState & {
  classPrefix: string
  section: EntryNavSection
  open: boolean
}): JSX.Element {
  return (
    <Collapse in={open}>
      <ul className={`${classPrefix}__nav-sublist`}>
        {section.subsections.map((subsection) => (
          <li key={subsection.id} className={`${classPrefix}__nav-subitem`}>
            <NavAnchor
              id={subsection.id}
              className={`${classPrefix}__nav-sublink`}
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
  classPrefix,
  sections,
  openSections,
  onToggleSection,
  ...navigation
}: NavigationState & {
  classPrefix: string
  sections: readonly EntryNavSection[]
  openSections: Readonly<Record<string, boolean>>
  onToggleSection: (id: string) => void
}): JSX.Element {
  return (
    <ul className={`${classPrefix}__nav-list`}>
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
            className={classNames(`${classPrefix}__nav-item`, {
              'is-active-group': isActiveGroup,
            })}
          >
            <div className={`${classPrefix}__nav-row`}>
              <SectionToggle
                classPrefix={classPrefix}
                section={section}
                open={open}
                onToggleSection={onToggleSection}
              />
              <NavAnchor
                id={section.id}
                className={`${classPrefix}__nav-link`}
                {...navigation}
              >
                {section.label}
              </NavAnchor>
            </div>
            {section.subsections.length > 0 && (
              <NavSubsections
                classPrefix={classPrefix}
                section={section}
                open={open}
                {...navigation}
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}
