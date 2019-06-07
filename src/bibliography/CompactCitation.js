import React, { Fragment } from 'react'
import _ from 'lodash'

export default function CompactCitation({ reference }) {
  return (
    <Fragment>
      {reference.document.author}
      {', '}
      {reference.document.year}
      {reference.pages && <>: {reference.pages}</>}{' '}
      {!_.isEmpty(reference.linesCited) && (
        <>[l. {reference.linesCited.join(', ')}]</>
      )}{' '}
      ({reference.typeAbbreviation})
    </Fragment>
  )
}
