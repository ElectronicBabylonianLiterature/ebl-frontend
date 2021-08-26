import React from 'react'
import { RawAnnotation } from 'fragmentarium/domain/annotation'

interface Props {
  annotation: RawAnnotation
  active: boolean
  isToggled: boolean
}
export default function Highlight({
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
          transform: 'scale(0.5)',
          transformOrigin: 'top left',
          position: 'absolute',
          left: `${annotation.geometry.x}%`,
          top: `${annotation.geometry.y}%`,
          height: `${annotation.geometry.height * 2}%`,
          width: `${annotation.geometry.width * 2}%`,
          boxShadow: active
            ? '0 0 20px 20px rgba(255, 255, 255, 0.3) inset'
            : undefined,
          background: isToggled ? 'rgba(0,0,0,0.3)' : undefined,
          border: isToggled ? 'dashed 2px white' : 'solid 1px aliceblue',
        }}
      />
    )
  } else {
    return null
  }
}
