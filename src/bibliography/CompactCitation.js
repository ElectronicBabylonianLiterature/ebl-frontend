// @flow
import React from 'react'
import Reference from './Reference'

import './CompactCitation.css'

export default function CompactCitation({
  reference
}: {
  reference: Reference
}) {
  return (
    <>
      {reference.useContainerCitation ? (
        <>
          <span className="CompactCitation__container-title">
            {reference.shortContainerTitle}
          </span>{' '}
          {reference.collectionNumber && `${reference.collectionNumber}, `}
          {reference.pages}{' '}
          {reference.hasLinesCited &&
            `[l. ${reference.linesCited.join(', ')}] `}
          ({reference.typeAbbreviation})
        </>
      ) : (
        reference.compactCitation
      )}
    </>
  )
}
