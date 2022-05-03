import React from 'react'
import _ from 'lodash'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import Reference, { groupReferences } from 'bibliography/domain/Reference'
import Citation from 'bibliography/ui/Citation'

import './ManuscriptPopover.sass'
import { ManuscriptLineDisplay } from 'corpus/domain/line-details'
import { OldSiglum } from 'corpus/domain/manuscript'
import { ManuscriptJoins } from './Chapters'

function OldSiglumList({
  siglumList,
}: {
  siglumList: readonly OldSiglum[]
}): JSX.Element {
  return _.isEmpty(siglumList) ? (
    <>{''}</>
  ) : (
    <>
      {' ('}
      {siglumList.map((oldSiglum, index) => (
        <React.Fragment key={index}>
          {index > 0 && ', '}
          {oldSiglum.siglum}
          <sup>{oldSiglum.reference.authors.join('/')}</sup>
        </React.Fragment>
      ))}
      {')'}
    </>
  )
}

function PopOverReferences({
  references,
}: {
  references: readonly Reference[]
}): JSX.Element {
  return (
    <ul className="list-of-manuscripts__references">
      {groupReferences(references)
        .flatMap(([type, group]) => group)
        .map((reference, index) => (
          <li key={index}>
            <Citation reference={reference} />
          </li>
        ))}
    </ul>
  )
}

export default function ManuscriptPopOver({
  manuscript,
}: {
  manuscript: ManuscriptLineDisplay
}): JSX.Element {
  const popover = (
    <Popover
      id={_.uniqueId('ManuscriptPopOver-')}
      className="manuscript-popover__popover"
    >
      <Popover.Title as="h3" className="manuscript-popover__header">
        {manuscript.siglum}
        <OldSiglumList siglumList={manuscript.oldSigla} />
      </Popover.Title>
      <Popover.Content>
        <p>
          <ManuscriptJoins manuscript={manuscript} />
        </p>
        <p>
          <span className="manuscript-popover__provenance">
            {manuscript.provenance.parent}
          </span>{' '}
          &gt; {manuscript.provenance.name};{' '}
          {manuscript.type.displayName ?? manuscript.type.name}
          <br />
          {manuscript.period.name} {manuscript.period.description}
          <br />
        </p>
        <PopOverReferences references={manuscript.references} />
      </Popover.Content>
    </Popover>
  )
  return (
    <OverlayTrigger
      rootClose
      overlay={popover}
      trigger={['click']}
      placement="top"
    >
      <span className="reference-popover__citation">
        <div className="test">{manuscript.siglum}</div>
      </span>
    </OverlayTrigger>
  )
}
