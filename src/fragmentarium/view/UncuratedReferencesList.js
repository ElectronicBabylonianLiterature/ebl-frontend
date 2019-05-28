import React from 'react'
import { ListGroup } from 'react-bootstrap'

export default function UncuratedReferencesList ({
  uncuratedReferences,
  ...props
}) {
  return (
    <ListGroup as='ul' variant='flush' {...props}>
      {uncuratedReferences.map((reference, index) => (
        <ListGroup.Item as='li' key={index}>
          {reference.document}
          {!reference.pages.isEmpty() && <>: {reference.pages.join(', ')}</>}
        </ListGroup.Item>
      ))}
    </ListGroup>
  )
}
