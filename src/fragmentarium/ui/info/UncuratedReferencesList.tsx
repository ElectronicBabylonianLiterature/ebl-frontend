import React from 'react'
import { ListGroup, ListGroupProps } from 'react-bootstrap'
import _ from 'lodash'
import { UncuratedReference } from 'fragmentarium/domain/fragment'
import './UncuratedReferencesList.css'

export default function UncuratedReferencesList({
  uncuratedReferences,
  ...props
}: {
  uncuratedReferences: ReadonlyArray<UncuratedReference>
} & ListGroupProps &
  React.HTMLAttributes<HTMLUListElement>): JSX.Element {
  const sortedReferences = _.orderBy(
    uncuratedReferences,
    [
      (ref) => ref.searchTerm?.toLowerCase(),
      (ref) => ref.pages.length,
      'document',
    ],
    ['asc', 'asc', 'asc']
  )

  return (
    <ListGroup as="ul" variant="flush" {...props}>
      {sortedReferences.map((reference, index) => (
        <ListGroup.Item as="li" key={index}>
          {reference.searchTerm && (
            <span>
              (
              <span className="UncuratedReferencesList__searchTerm">
                {reference.searchTerm}
              </span>
              ){' '}
            </span>
          )}
          {reference.document}
          {!_.isEmpty(reference.pages) && <>: {reference.pages.join(', ')}</>}
        </ListGroup.Item>
      ))}
    </ListGroup>
  )
}
