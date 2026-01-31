import React from 'react'
import _ from 'lodash'
import Reference, { groupReferences } from 'bibliography/domain/Reference'
import CompactCitation from './CompactCitation'
import './ReferenceList.css'

function groupReferencesById(references: readonly Reference[]): Reference[][] {
  return _.values(
    _.groupBy(references, (reference) => `${reference.id}-${reference.type}`),
  )
}

function ReferenceGroup({
  references,
}: {
  references: ReadonlyArray<Reference>
}): JSX.Element {
  return (
    <ol className="ReferenceList__list">
      {groupReferencesById(references).map((group, index) => (
        <li key={index}>
          <CompactCitation references={group} />
        </li>
      ))}
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
