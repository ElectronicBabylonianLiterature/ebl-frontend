import React from 'react'
import { ListGroup, ListGroupProps } from 'react-bootstrap'
import _ from 'lodash'
import { UncuratedReference } from 'fragmentarium/domain/fragment'
import { classNames } from 'classnames';

export default function UncuratedReferencesList({
  uncuratedReferences,
  ...props
}: {
  uncuratedReferences: ReadonlyArray<UncuratedReference>,
  className: string
} & ListGroupProps) {
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