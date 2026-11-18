import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import { WordLink } from 'sumerian-dictionary/domain/SumerianWordParts'
import { formatCount } from 'sumerian-dictionary/domain/sumerianWordHelpers'
import { CitationFormText } from 'sumerian-dictionary/ui/SumerianCitationForm'
import { getSumerianWordPageUrl } from 'sumerian-dictionary/ui/sumerianDictionaryPage'
import { SumerianSubsectionDefinition } from 'sumerian-dictionary/ui/sumerianWordSections'

export function SumerianSubsection({
  part,
  word,
  children,
}: {
  part: SumerianSubsectionDefinition
  word: SumerianWord
  children: React.ReactNode
}): JSX.Element {
  const note = part.note(word)
  return (
    <section
      id={part.id}
      className="SumerianDictionary__subsection"
      aria-labelledby={`${part.id}-title`}
    >
      <h3
        id={`${part.id}-title`}
        className="SumerianDictionary__subsection-title"
      >
        {part.heading}
        {note && <small>{note}</small>}
      </h3>
      <div className="SumerianDictionary__subsection-body">{children}</div>
    </section>
  )
}

export function SumerianWordLink({ link }: { link: WordLink }): JSX.Element {
  return (
    <Link to={getSumerianWordPageUrl(link.id)}>
      <CitationFormText citationForm={link.citationForm} />
      {[link.homonym, link.guideWord].filter(Boolean).map((detail, index) => (
        <React.Fragment key={index}>
          {' '}
          <small>{detail}</small>
        </React.Fragment>
      ))}
    </Link>
  )
}

export function SumerianWordLinks({
  links,
}: {
  links: readonly WordLink[]
}): JSX.Element {
  return (
    <ul className="SumerianDictionary__links">
      {links.map((link) => (
        <li key={link.id}>
          <SumerianWordLink link={link} />
        </li>
      ))}
    </ul>
  )
}

export function SectionNote({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return <p className="SumerianDictionary__note">{children}</p>
}

export function useShowAll<T>(
  items: readonly T[],
  shownCount: number,
): {
  shown: readonly T[]
  hiddenCount: number
  expanded: boolean
  toggle: () => void
} {
  const [expanded, setExpanded] = useState(false)
  return {
    shown: expanded ? items : items.slice(0, shownCount),
    hiddenCount: Math.max(items.length - shownCount, 0),
    expanded,
    toggle: (): void => setExpanded((previous) => !previous),
  }
}

export function ShowAllToggle({
  expanded,
  total,
  noun,
  collapsedLabel,
  onToggle,
}: {
  expanded: boolean
  total: number
  noun: string
  collapsedLabel: string
  onToggle: () => void
}): JSX.Element {
  return (
    <Button
      variant="outline-secondary"
      size="sm"
      className="SumerianDictionary__toggle"
      aria-expanded={expanded}
      onClick={onToggle}
    >
      {expanded ? collapsedLabel : `Show all ${formatCount(total)} ${noun}`}
    </Button>
  )
}
