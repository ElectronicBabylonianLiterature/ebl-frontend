import React, { Fragment } from 'react'

export default function CompactCitation ({ reference }) {
  return (
    <Fragment>
      {reference.document.author}
      {', '}
      {reference.document.year}
      {reference.pages && <>: {reference.pages}</>}{' '}
      {!reference.linesCited.isEmpty() && (
        <>[l. {reference.linesCited.join(', ')}]</>
      )}{' '}
      ({reference.typeAbbreviation})
    </Fragment>
  )
}
