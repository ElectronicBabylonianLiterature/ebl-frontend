import React from 'react'
import _ from 'lodash'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import CompactCitation from './CompactCitation'
import FullCitation from './FullCitation'
import Reference from 'bibliography/domain/Reference'

export default function Citation({
  reference,
}: {
  reference: Reference
}): JSX.Element {
  const popover = (
    <Popover id={_.uniqueId('Citation-')} className="ReferenceList__popover">
      <Popover.Content>
        <FullCitation reference={reference} />
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
      <span className="ReferenceList__citation">
        <CompactCitation reference={reference} />
      </span>
    </OverlayTrigger>
  )
}
