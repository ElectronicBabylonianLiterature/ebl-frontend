import React from 'react'
import _ from 'lodash'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import './ManuscriptPopover.sass'
import { ManuscriptLineDisplay } from 'corpus/domain/line-details'
import { OldSiglum } from 'corpus/domain/manuscript'
import ManuscriptJoins from './ManuscriptJoins'
import ManuscriptReferences from './ManuscriptReferences'

function OldSiglumList({
  siglumList,
}: {
  siglumList: readonly OldSiglum[]
}): JSX.Element | null {
  return !_.isEmpty(siglumList) ? (
    <span className="manuscript-popover__old-sigla">
      &nbsp;(
      {siglumList.map((oldSiglum, index) => (
        <React.Fragment key={index}>
          {index > 0 && ', '}
          {oldSiglum.siglum}
          <sup>{oldSiglum.reference.authors.join('/')}</sup>
        </React.Fragment>
      ))}
      )
    </span>
  ) : null
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
      <Popover.Content className="manuscript-popover__body">
        <p>
          <ManuscriptJoins manuscript={manuscript} />
        </p>
        <p>
          {manuscript.provenance.parent !== null && (
            <span className="manuscript-popover__provenance">
              {manuscript.provenance.parent}
              &nbsp;&gt;&nbsp;
            </span>
          )}
          {manuscript.provenance.name};{' '}
          {manuscript.type.displayName ?? manuscript.type.name}
          <br />
          {manuscript.period.name} {manuscript.period.description}
          <br />
        </p>
        <ManuscriptReferences references={manuscript.references} />
      </Popover.Content>
    </Popover>
  )
  return (
    <OverlayTrigger
      rootClose
      overlay={popover}
      trigger={['click']}
      placement="right"
    >
      <span className="reference-popover__citation">{manuscript.siglum}</span>
    </OverlayTrigger>
  )
}
