import React, { useState } from 'react'
import classNames from 'classnames'
import { EntryNavSection } from 'common/ui/entry-page/entryNavSections'
import EntryNavList, { NavAnchor } from 'common/ui/entry-page/EntryNavList'

const navBodyId = 'realia-nav-body'

interface Props {
  title: string
  typeLabel: string | null
  topId: string
  sections: readonly EntryNavSection[]
  openSections: Readonly<Record<string, boolean>>
  activeId: string | null
  selectedId: string | null
  onToggleSection: (id: string) => void
  onNavigate: (id: string) => void
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
  const [expanded, setExpanded] = useState(false)
  const navigate = (id: string): void => {
    setExpanded(false)
    onNavigate(id)
  }
  return (
    <nav
      className={classNames('Realia__nav', { 'is-expanded': expanded })}
      aria-label="On this page"
    >
      <button
        type="button"
        className="Realia__nav-menu-toggle"
        aria-expanded={expanded}
        aria-controls={navBodyId}
        onClick={(): void => setExpanded(!expanded)}
      >
        <i
          className={classNames('fas', {
            'fa-caret-down': expanded,
            'fa-caret-right': !expanded,
          })}
          aria-hidden="true"
        />
        On this page
      </button>
      <div id={navBodyId} className="Realia__nav-body">
        <NavAnchor
          id={topId}
          className="Realia__nav-top"
          activeId={activeId}
          selectedId={selectedId}
          onNavigate={navigate}
        >
          <span className="Realia__nav-top-title">{title}</span>
          {typeLabel && (
            <span className="Realia__nav-top-type">{typeLabel}</span>
          )}
        </NavAnchor>
        <EntryNavList
          classPrefix="Realia"
          sections={sections}
          openSections={openSections}
          activeId={activeId}
          selectedId={selectedId}
          onToggleSection={onToggleSection}
          onNavigate={navigate}
        />
      </div>
    </nav>
  )
}
