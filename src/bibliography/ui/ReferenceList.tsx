import React from 'react'
import _ from 'lodash'
import Reference, { groupReferences } from 'bibliography/domain/Reference'
import Citation from './Citation'

import './ReferenceList.css'

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
      {_.isEmpty(references) ? (
        <p>No references</p>
      ) : (
        groupReferences(references).map(([type, group]) => (
          <ReferenceGroup key={type} references={group} />
        ))
      )}
    </>
  )
}
