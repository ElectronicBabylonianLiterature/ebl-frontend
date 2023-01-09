import React from 'react'
import { Row } from 'react-bootstrap'

export function EmptySection({ as }: { as?: React.ElementType }): JSX.Element {
  return (
    <Row className="ml-5 empty-section" as={as}>
      No entries
    </Row>
  )
}
