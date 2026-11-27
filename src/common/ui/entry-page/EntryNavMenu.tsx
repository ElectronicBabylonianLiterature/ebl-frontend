import React from 'react'
import { EntryNavSection } from 'common/ui/entry-page/entryNavSections'
import EntryNavList, { NavAnchor } from 'common/ui/entry-page/EntryNavList'

interface Props {
  title: React.ReactNode
  subtitle: string | null
  topId: string
  sections: readonly EntryNavSection[]
  openSections: Readonly<Record<string, boolean>>
  activeId: string | null
  selectedId: string | null
  onToggleSection: (id: string) => void
  onNavigate: (id: string) => void
}

export default function EntryNavMenu({
  title,
  subtitle,
  topId,
  sections,
  openSections,
  activeId,
  selectedId,
  onToggleSection,
  onNavigate,
}: Props): JSX.Element {
  return (
    <nav className="EntryPage__nav" aria-label="On this page">
      <NavAnchor
        id={topId}
        className="EntryPage__nav-top"
        activeId={activeId}
        selectedId={selectedId}
        onNavigate={onNavigate}
      >
        <span className="EntryPage__nav-top-title">{title}</span>
        {subtitle && (
          <span className="EntryPage__nav-top-type">{subtitle}</span>
        )}
      </NavAnchor>
      <EntryNavList
        classPrefix="EntryPage"
        sections={sections}
        openSections={openSections}
        activeId={activeId}
        selectedId={selectedId}
        onToggleSection={onToggleSection}
        onNavigate={onNavigate}
      />
    </nav>
  )
}
