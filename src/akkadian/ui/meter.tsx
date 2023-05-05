import React from 'react'
import { Segment } from 'akkadian/application/phonetics/segments'

export default function Meter(props: { segments: Segment[] }): JSX.Element {
  const meter = props.segments.map((segment) => segment.meter).join(' ')
  return <span className="meter-display">{meter}</span>
}
