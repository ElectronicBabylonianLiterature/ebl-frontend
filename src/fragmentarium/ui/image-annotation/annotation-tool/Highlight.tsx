import React from 'react'
import { RawAnnotation } from 'fragmentarium/domain/annotation'

interface Props {
  scale: number
  annotation: RawAnnotation
  active: boolean
  isToggled: boolean
}
export default function Highlight({
  scale,
  annotation,
  active,
  isToggled,
}: Props): JSX.Element | null {
  if (annotation.geometry && annotation.data) {
    return (
      <div
        data-testid="annotation__box"
        key={annotation.data.id}
        style={{
          // scale object to make boarder look thinner than 1px
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          left: `${annotation.geometry.x}%`,
          top: `${annotation.geometry.y}%`,
          height: `${annotation.geometry.height * (1 / scale)}%`,
          width: `${annotation.geometry.width * (1 / scale)}%`,
          boxShadow: active
            ? '0 0 20px 20px rgba(255, 255, 255, 0.3) inset'
            : undefined,
          background: isToggled ? 'rgba(0,0,0,0.3)' : undefined,
          border: isToggled ? 'dashed 2px white' : 'solid 1px aliceblue',
          padding: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '-1px',
            left: '-1px',
            margin: 0,
            padding: 0,
            background: 'whitesmoke',
            opacity: 0.5,
            fontSize: `${scale > 0.7 ? '0.5em' : '.8em'}`,
          }}
        >
          {annotation.data.value}
        </span>
      </div>
    )
  } else {
    return null
  }
}
