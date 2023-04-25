import React from 'react'
import { Segment } from 'akkadian/application/phonetics/segments'

export default function Ipa(props: {
  segments: Segment[]
  enclose?: boolean
}): JSX.Element {
  const ipaTranscription = props.segments
    .map((segment) => segment.ipa)
    .join(' ')
  return (
    <div className="ipa-display">
      {props.enclose ? `[${ipaTranscription}]` : ipaTranscription}
    </div>
  )
}
