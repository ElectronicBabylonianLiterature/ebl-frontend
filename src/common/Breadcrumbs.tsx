import React from 'react'
import { Breadcrumb } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import _ from 'lodash'

export interface Crumb {
  readonly text: string
  readonly link: string | null | undefined
}

export class SectionCrumb implements Crumb {
  static readonly SECTIONS: ReadonlyMap<string, string> = new Map([
    ['eBL', '/'],
    ['Bibliography', '/bibliography'],
    ['Corpus', '/corpus'],
    ['Dictionary', '/dictionary'],
    ['Fragmentarium', '/fragmentarium']
  ])

  readonly text: string

  constructor(section: string) {
    this.text = section
  }

  get link(): string | undefined {
    return SectionCrumb.SECTIONS.get(this.text)
  }
}

export class TextCrumb implements Crumb {
  readonly text: string

  constructor(text: string) {
    this.text = text
  }

  get link(): null {
    return null
  }
}

function CrumbComponent({ crumb }: { crumb: Crumb }): JSX.Element {
  const item = <Breadcrumb.Item>{crumb.text}</Breadcrumb.Item>
  return crumb.link ? (
    <LinkContainer to={crumb.link}>{item}</LinkContainer>
  ) : (
    item
  )
}

export default function Breadcrumbs({
  crumbs
}: {
  crumbs: ReadonlyArray<Crumb>
}): JSX.Element {
  const initial = [new SectionCrumb('eBL'), ..._.initial(crumbs)]
  const last = _.last(crumbs)
  return (
    <Breadcrumb>
      {initial.map((crumb, index) => (
        <CrumbComponent key={index} crumb={crumb} />
      ))}
      {last && <Breadcrumb.Item active>{last.text}</Breadcrumb.Item>}
    </Breadcrumb>
  )
}
