import React from 'react'
import transcriptionToPhoneticSegments from 'akkadian/application/phonetics/segments'

export default function Meter(props: { transcription: string[] }): JSX.Element {
  try {
    const meter = transcriptionToPhoneticSegments(props.transcription, {})
      .map((segment) => segment.meter)
      .join(' ')
    return <span className="meter-display">{meter}</span>
  } catch (error) {
    return <></>
  }
}
