import React from 'react'
import _ from 'lodash'
import CompactCitation from 'bibliography/CompactCitation'

import './ReferenceList.css'

const typeOrder = {
  COPY: 1,
  PHOTO: 2,
  EDITION: 3,
  DISCUSSION: 4
}

function compare (reference, other) {
  if (reference.type !== other.type) {
    return Math.sign(
      _.get(typeOrder, reference.type, 5) - _.get(typeOrder, other.type, 5)
    )
  } else {
    return reference.author.localeCompare(other.author)
  }
}

export default function ReferenceList ({ references }) {
  return <ol className='ReferenceList__list'>
    {references.sort(compare).map((reference, index) =>
      <li key={index}>
        <CompactCitation reference={reference} />
      </li>
    )}
    {_.isEmpty(references) && <li>No references</li>}
  </ol>
}
