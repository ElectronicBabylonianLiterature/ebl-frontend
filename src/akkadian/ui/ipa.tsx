import React from 'react'
import transcriptionToPhoneticSegments from 'akkadian/application/phonetics/segments'
import { IpaOptions } from 'akkadian/application/phonetics/ipa'
import { MeterOptions } from 'akkadian/application/phonetics/meter'

export default function Ipa(props: {
  transcription: readonly string[]
  options?: {
    ipaOptions?: IpaOptions
    meterOptions?: MeterOptions
  }
  enclose?: boolean
}): JSX.Element {
  try {
    const ipaTranscription = transcriptionToPhoneticSegments(
      props.transcription,
      props.options ?? {}
    )
      .map((segment) => segment.ipa)
      .join(' ')
    return (
      <div className="ipa-display">
        {props.enclose ? `[${ipaTranscription}]` : ipaTranscription}
      </div>
    )
  } catch (error) {
    return <></>
  }
}
