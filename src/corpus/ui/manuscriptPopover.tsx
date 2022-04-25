import React from 'react'
import _ from 'lodash'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import Reference, { groupReferences } from 'bibliography/domain/Reference'
import Citation from 'bibliography/ui/Citation'

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

function PopOverReferences({
  references,
}: {
  references: Reference[]
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
          <br />
        </p>
        <p>
          <PopOverReferences references={manuscript.references} />
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
