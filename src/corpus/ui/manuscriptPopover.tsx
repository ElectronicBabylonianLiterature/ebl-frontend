import React from 'react'
import _ from 'lodash'
import { Popover, OverlayTrigger } from 'react-bootstrap'

function OldSiglumList({ siglumList }): JSX.Element {
  return _.isEmpty(siglumList) ? (
    <>{''}</>
  ) : (
    <span>
      {'('}
      {siglumList.map((oldSiglum, index) => (
        <span key={index}>
          {index > 0 && ', '}
          {oldSiglum.siglum}
          <sup>
            {oldSiglum.reference.document.author
              .map((author) => author.family)
              .join(', ')}
          </sup>
        </span>
      ))}
      {')'}
    </span>
  )
}

export default function ManuscriptPopOver({ manuscript }): JSX.Element {
  const popover = (
    <Popover
      id={_.uniqueId('ManuscriptPopOver-')}
      className="manuscript-popover__popover"
    >
      <Popover.Title as="h3">
        {manuscript.siglum}&nbsp;
        <OldSiglumList siglumList={manuscript.oldSigla} />
      </Popover.Title>
      <Popover.Content>
        <p>
          {manuscript.provenance.parent} &gt; {manuscript.provenance.name};{' '}
          {manuscript.type.name}
          <br />
          {manuscript.period.name} {manuscript.period.description}
        </p>
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
