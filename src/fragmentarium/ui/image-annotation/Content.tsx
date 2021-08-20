import React, { ReactElement } from 'react'
import { Button, Card } from 'react-bootstrap'
import Annotation from 'fragmentarium/domain/annotation'

export type ContentProps = {
  setHovering: any
  annotation: Annotation
  onDelete: (annotation: Annotation) => void
}

export default function Content({
  setHovering,
  annotation,
  onDelete,
}: ContentProps): ReactElement {
  const { geometry, data, outdated } = annotation
  setHovering(annotation)
  const cardStyle = outdated ? 'warning' : 'light'
  const textStyle = outdated ? 'white' : undefined
  const sign = data.sign ? data.sign : ''
  return (
    <div
      key={data.id}
      style={{
        position: 'absolute',
        left: `${geometry.x}%`,
        top: `${geometry.y + geometry.height}%`,
      }}
    >
      <Card bg={cardStyle} text={textStyle}>
        <Card.Body>{data.value}</Card.Body>
        {sign && <Card.Body>{sign}</Card.Body>}
        <Card.Footer>
          <Button onClick={(): void => onDelete(annotation)}>Delete</Button>
        </Card.Footer>
      </Card>
    </div>
  )
}
