import React from 'react'

export default function Highlight({ annotation, active, isChecked }) {
  const { geometry } = annotation
  if (!geometry) return null
  return (
    <input
      disabled
      type={'checkbox'}
      checked={isChecked}
      data-testid="annotation__box"
      key={annotation.data.id}
      style={{
        position: 'absolute',
        left: `${geometry.x}%`,
        top: `${geometry.y}%`,
        height: `${geometry.height}%`,
        width: `${geometry.width}%`,
        border: 'solid 0.0001em black',
        boxShadow: active && '0 0 20px 20px rgba(255, 255, 255, 0.3) inset',
      }}
    />
  )
}
