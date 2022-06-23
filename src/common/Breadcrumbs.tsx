import React from 'react'
import { Breadcrumb } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import _ from 'lodash'

export interface Crumb {
  readonly text: React.ReactNode
  readonly link: string | null
}

export class SectionCrumb implements Crumb {
  static readonly SECTIONS: ReadonlyMap<string, string> = new Map([
    ['eBL', '/'],
    ['Bibliography', '/bibliography'],
    ['Corpus', '/corpus'],
    ['Dictionary', '/dictionary'],
    ['Fragmentarium', '/fragmentarium'],
    ['Signs', '/signs'],
  ])

  readonly text: string

  constructor(section: string) {
    this.text = section
  }

  get link(): string | null {
    return SectionCrumb.SECTIONS.get(this.text) ?? null
  }
}

export class TextCrumb implements Crumb {
  readonly text: React.ReactNode

  constructor(text: React.ReactNode) {
    this.text = text
  }

  get link(): null {
    return null
  }
}

function CrumbComponent({ crumb }: { crumb: Crumb }): JSX.Element {
  const item = (
    <Breadcrumb.Item active={!crumb.link}>{crumb.text}</Breadcrumb.Item>
  )
  return crumb.link ? (
    <LinkContainer to={crumb.link}>{item}</LinkContainer>
  ) : (
    item
  )
}

export default function Breadcrumbs({
  crumbs,
  className,
  hasFullPath,
}: {
  crumbs: ReadonlyArray<Crumb>
  className?: string
  hasFullPath?: boolean
}): JSX.Element {
  const initial = hasFullPath
    ? [new SectionCrumb('eBL'), ..._.initial(crumbs)]
    : [..._.initial(crumbs)]
  const last = _.last(crumbs)
  return (
    <Breadcrumb className={className}>
      {initial.map((crumb, index) => (
        <CrumbComponent key={index} crumb={crumb} />
      ))}
      {last && <Breadcrumb.Item active>{last.text}</Breadcrumb.Item>}
    </Breadcrumb>
  )
}
