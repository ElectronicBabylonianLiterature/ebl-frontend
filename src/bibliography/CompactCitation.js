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
      {reference.useContainerTitle ? (
        <>
          <span className="CompactCitation__container-title">
            {reference.shortContainerTitle}
          </span>{' '}
          {reference.collectionNumber ? `${reference.collectionNumber}, ` : ''}
          {reference.pages}
        </>
      ) : (
        reference.compactCitation
      )}
    </>
  )
}
