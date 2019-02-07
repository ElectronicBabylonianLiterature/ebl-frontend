import React from 'react'
import _ from 'lodash'
import { Popover, OverlayTrigger } from 'react-bootstrap'
import CompactCitation from 'bibliography/CompactCitation'
import FullCitation from 'bibliography/FullCitation'

import './ReferenceList.css'

const typeOrder = {
  COPY: 1,
  PHOTO: 2,
  EDITION: 3,
  DISCUSSION: 4
}

function Citation ({ reference }) {
  const popover = (
    <Popover id={_.uniqueId('Citation-')} className='ReferenceList__popover'>
      <FullCitation reference={reference} />
    </Popover>
  )

  return <OverlayTrigger
    rootClose
    overlay={popover}
    trigger={['click']}
    placement='right'>
    <span className='ReferenceList__citation'><CompactCitation reference={reference} /></span>
  </OverlayTrigger>
}

function ReferenceGroup ({ references }) {
  return (
    <ol className='ReferenceList__list'>
      {_.sortBy(references, 'document.author', 'document.year').map((reference, index) =>
        <li key={index}>
          <Citation reference={reference} />
        </li>
      )}
    </ol>
  )
}

export default function ReferenceList ({ references }) {
  return <>
    {_(references)
      .groupBy('type')
      .toPairs()
      .sortBy(([type, group]) => _.get(typeOrder, type, 5))
      .map(([type, group]) => <ReferenceGroup key={type} references={group} />)
      .value()}
    {_.isEmpty(references) && <p>No references</p>}
  </>
}
