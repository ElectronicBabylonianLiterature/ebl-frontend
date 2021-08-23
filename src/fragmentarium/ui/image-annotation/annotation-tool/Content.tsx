import React, { ReactElement, useState } from 'react'
import { Button, Card } from 'react-bootstrap'
import Annotation from 'fragmentarium/domain/annotation'
import _ from 'lodash'

export type ContentProps = {
  setHovering: any
  annotation: Annotation
  onDelete: (annotation: Annotation) => void
  setToggled: (annotation: Annotation | undefined) => void
  toggled: Annotation | undefined
}

export default function Content({
  setHovering,
  annotation,
  onDelete,
  setToggled,
  toggled,
}: ContentProps): ReactElement {
  const [toggle, setToggle] = useState(_.isEqual(toggled, annotation))
  const { geometry, data, outdated } = annotation
  setHovering(annotation)
  const cardStyle = outdated ? 'warning' : 'light'
  const textStyle = outdated ? 'white' : undefined
  const sign = data.sign ? data.sign : ''

  const onClick = () => {
    if (toggle) {
      setToggled(undefined)
    } else {
      setToggled(annotation)
    }
    setToggle(!toggle)
  }
  return (
    <>
      <input
        checked={toggle}
        type={'checkbox'}
        onClick={() => onClick()}
        key={data.id}
        style={{
          position: 'absolute',
          left: `${geometry.x}%`,
          top: `${geometry.y}%`,
          height: `${geometry.height}%`,
          width: `${geometry.width}%`,
        }}
      />
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
    </>
  )
}
