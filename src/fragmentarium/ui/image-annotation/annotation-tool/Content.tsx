import React, { ReactElement, useEffect } from 'react'
import { Button, Card } from 'react-bootstrap'
import Annotation from 'fragmentarium/domain/annotation'
import Bluebird from 'bluebird'

export type ContentProps = {
  annotation: Annotation
  onDelete: (annotation: Annotation) => Bluebird<readonly Annotation[]>
  contentScale: number
  setHovering: (annotation: Annotation | null) => void
  displayCards: boolean
}

export default function Content({
  setHovering,
  contentScale,
  annotation,
  onDelete,
  displayCards,
}: ContentProps): ReactElement {
  const { geometry, data, outdated } = annotation

  const cardStyle = outdated ? 'warning' : 'light'
  const textStyle = outdated ? 'white' : undefined
  const sign = data.signName ? data.signName : ''

  useEffect(() => {
    setHovering(annotation)
    function debug(event) {
      console.log(event.code)
      if (event.code === 'Delete') {
        onDelete(annotation).then()
      }
    }

    document.addEventListener('keypress', debug, false)
    return () => {
      document.removeEventListener('keypress', debug, false)
      setHovering(null)
    }
  }, [annotation, setHovering, onDelete])

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
      {sign && displayCards && (
        <Card bg={cardStyle} text={textStyle}>
          <Card.Body className={'p-1'}>
            {data.value}
            {sign && `/ ${sign}`}
          </Card.Body>
          <Card.Footer className={'p-1'}>
            <Button
              size={'sm'}
              variant="danger"
              onClick={() => onDelete(annotation)}
            >
              Delete
            </Button>
          </Card.Footer>
        </Card>
      )}
    </div>
  )
}
