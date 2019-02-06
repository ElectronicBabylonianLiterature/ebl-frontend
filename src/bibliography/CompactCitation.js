import React, { Fragment } from 'react'

export default function CompactCitation ({ reference }) {
  return <Fragment>
    {reference.author}
    {', '}
    {reference.year}
    {reference.pages &&
      <>: {reference.pages}</>
    }
    {' '}
    {!reference.linesCited.isEmpty() &&
      <>[l. {reference.linesCited.join(', ')}]</>}
    {' '}
    ({reference.typeAbbreviation})
  </Fragment>
}
