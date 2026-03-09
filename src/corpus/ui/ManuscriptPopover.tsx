import React from 'react'
import _ from 'lodash'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import './ManuscriptPopover.sass'
import { ManuscriptLineDisplay } from 'corpus/domain/line-details'
import { OldSiglum } from 'corpus/domain/manuscript'
import ManuscriptJoins from './ManuscriptJoins'
import ManuscriptReferences from './ManuscriptReferences'
import Citation from 'bibliography/ui/Citation'
import { Markdown } from 'common/Markdown'

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
          {index > 0 && '; '}
          <span className="manuscript-popover__old-sigla__bibliography">
            <Markdown text={oldSiglum.siglum} />
            {/* add bibliography info popover here */}

            <sup>
              <Citation reference={oldSiglum.reference} />
            </sup>
          </span>
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
      <Popover.Header as="h3" className="manuscript-popover__header">
        {manuscript.siglum}
        <OldSiglumList siglumList={manuscript.oldSigla} />
      </Popover.Header>
      <Popover.Body className="manuscript-popover__body">
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
      </Popover.Body>
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
