import React, { ReactElement, useEffect } from 'react'
import { Button, Card } from 'react-bootstrap'
import Annotation from 'fragmentarium/domain/annotation'

export type ContentProps = {
  annotation: Annotation
  onDelete: (annotation: Annotation) => void
  contentScale: number
  setHovering: (annotation: Annotation | null) => void
}

export default function Content({
  setHovering,
  contentScale,
  annotation,
  onDelete,
}: ContentProps): ReactElement {
  const { geometry, data, outdated } = annotation

  const cardStyle = outdated ? 'warning' : 'light'
  const textStyle = outdated ? 'white' : undefined
  const sign = data.signName ? data.signName : ''

  useEffect(() => {
    setHovering(annotation)
    return () => setHovering(null)
  }, [annotation, setHovering])

  return (
    <div
      data-testid={'content'}
      key={data.id}
      style={{
        transform: `scale(${contentScale})`,
        transformOrigin: 'top left',
        position: 'absolute',
        left: `${geometry.x}%`,
        top: `${geometry.y + geometry.height}%`,
      }}
    >
      <Card bg={cardStyle} text={textStyle}>
        <Card.Body className={'p-1'}>
          {data.value}
          {sign && `/ ${sign}`}
        </Card.Body>
        <Card.Footer className={'p-1'}>
          <Button
            size={'sm'}
            variant="danger"
            onClick={(): void => onDelete(annotation)}
          >
            Delete
          </Button>
        </Card.Footer>
      </Card>
    </div>
  )
}
