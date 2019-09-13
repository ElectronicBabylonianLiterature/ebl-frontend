// @flow
import React from 'react'
import { ListGroup } from 'react-bootstrap'
import _ from 'lodash'
import type { UncuratedReference } from '../fragment'

export default function UncuratedReferencesList({
  uncuratedReferences,
  ...props
}: {
  uncuratedReferences: $ReadOnlyArray<UncuratedReference>
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
