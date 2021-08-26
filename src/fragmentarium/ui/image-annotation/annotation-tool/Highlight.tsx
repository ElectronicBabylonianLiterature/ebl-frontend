import React from 'react'

interface Props {
  annotation
  active: boolean
  isToggled: boolean
}
export default function Highlight({
  annotation,
  active,
  isToggled,
}: Props): React.ReactNode {
  // scale object to make boarder look thinner than 1px
  const { geometry } = annotation
  if (!geometry) return null

  if (isToggled) {
    return (
      <div
        data-testid="annotation__box"
        key={annotation.data.id}
        style={{
          transform: 'scale(0.5)',
          transformOrigin: 'top left',
          position: 'absolute',
          left: `${geometry.x}%`,
          top: `${geometry.y}%`,
          height: `${geometry.height * 2}%`,
          width: `${geometry.width * 2}%`,
          boxShadow: active
            ? '0 0 20px 20px rgba(255, 255, 255, 0.3) inset'
            : undefined,
          background: 'rgba(0,0,0,0.3)',
          border: 'dashed 2px white',
        }}
      />
    )
  } else {
    return (
      <div
        data-testid="annotation__box"
        key={annotation.data.id}
        style={{
          transform: 'scale(0.5)',
          transformOrigin: 'top left',
          position: 'absolute',
          left: `${geometry.x}%`,
          top: `${geometry.y}%`,
          height: `${geometry.height * 2}%`,
          width: `${geometry.width * 2}%`,
          boxShadow: active
            ? '0 0 20px 20px rgba(255, 255, 255, 0.3) inset'
            : undefined,
          border: 'solid 1px aliceblue',
        }}
      />
    )
  }
}
