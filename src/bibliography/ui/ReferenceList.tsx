import React from 'react'
import _ from 'lodash'
import Reference from 'bibliography/domain/Reference'

import './ReferenceList.css'
import Citation from './Citation'

const typeOrder = {
  COPY: 1,
  PHOTO: 2,
  EDITION: 3,
  DISCUSSION: 4,
}

function ReferenceGroup({
  references,
}: {
  references: ReadonlyArray<Reference>
}): JSX.Element {
  return (
    <ol className="ReferenceList__list">
      {_.chain(references)
        .sortBy((reference) => `${reference.primaryAuthor} # ${reference.year}`)
        .map((reference, index) => (
          <li key={index}>
            <Citation reference={reference} />
          </li>
        ))
        .value()}
    </ol>
  )
}

export default function ReferenceList({
  references,
}: {
  references: ReadonlyArray<Reference>
}): JSX.Element {
  return (
    <>
      {_.chain(references)
        .groupBy((reference) => reference.type)
        .toPairs()
        .sortBy(([type, group]) => _.get(typeOrder, type, 5))
        .map(([type, group]) => (
          <ReferenceGroup key={type} references={group} />
        ))
        .value()}
      {_.isEmpty(references) && <p>No references</p>}
    </>
  )
}
