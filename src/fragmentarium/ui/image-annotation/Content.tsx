import React, { ReactElement } from 'react'
import { Button, Card } from 'react-bootstrap'
import Annotation from 'fragmentarium/domain/annotation'

export type ContentProps = {
  annotation: Annotation
  onDelete: (annotation: Annotation) => void
}

export default function Content({
  annotation,
  onDelete
}: ContentProps): ReactElement {
  const { geometry, data, outdated } = annotation
  const cardStyle = outdated ? 'warning' : 'light'
  const textStyle = outdated ? 'white' : undefined
  return (
    <div
      key={data.id}
      style={{
        position: 'absolute',
        left: `${geometry.x}%`,
        top: `${geometry.y + geometry.height}%`
      }}
    >
      <Card bg={cardStyle} text={textStyle}>
        <Card.Body>{data.value}</Card.Body>
        <Card.Footer>
          <Button onClick={(): void => onDelete(annotation)}>Delete</Button>
        </Card.Footer>
      </Card>
    </div>
  )
}
