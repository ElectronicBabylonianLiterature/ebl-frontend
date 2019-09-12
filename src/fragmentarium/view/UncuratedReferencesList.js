import React from 'react'
import { ListGroup } from 'react-bootstrap'
import _ from 'lodash'

export default function UncuratedReferencesList({
  uncuratedReferences,
  ...props
}) {
  return (
    <ListGroup as="ul" variant="flush" {...props}>
      {uncuratedReferences.map((reference, index) => (
        <ListGroup.Item as="li" key={index}>
          {reference.document}
          {!_.isEmpty(reference.pages) && <>: {reference.pages.join(', ')}</>}
        </ListGroup.Item>
      ))}
    </ListGroup>
  )
}
