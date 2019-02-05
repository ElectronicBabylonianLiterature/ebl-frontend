import React from 'react'
import _ from 'lodash'

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
    return reference.document.author[0].family.localeCompare(other.document.author[0].family)
  }
}

export default function ReferenceList ({ references }) {
  return <ol className='ReferenceList__list'>
    {references.sort(compare).map((reference, index) =>
      <li key={index}>
        {reference.document.author[0].family}
        {', '}
        {reference.document.issued['date-parts'][0][0]}
        {' : '}
        {reference.pages}
        {' '}
        [l. {reference.linesCited.join(', ')}]
        {' '}
        ({reference.type[0]})
      </li>
    )}
  </ol>
}
