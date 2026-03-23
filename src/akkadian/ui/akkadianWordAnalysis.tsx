import React from 'react'
import { AkkadianWord } from 'transliteration/domain/token'
import {
  PhoneticProps,
  Segment,
  tokenToPhoneticSegments,
} from 'akkadian/application/phonetics/segments'

function Meter(props: { segments: Segment[] }): JSX.Element {
  const meter = props.segments.map((segment) => segment.meter).join(' ')
  return <span className="meter-display">{meter}</span>
}

export function Ipa(props: {
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

export default function AkkadianWordAnalysis({
  word,
  showMeter,
  showIpa,
  phoneticProps,
}: {
  word: AkkadianWord
  showMeter: boolean
  showIpa: boolean
  phoneticProps?: PhoneticProps
}): JSX.Element {
  try {
    const segments = tokenToPhoneticSegments(word, phoneticProps)
    return (
      <>
        {showMeter && <Meter segments={segments} />}
        {showIpa && <Ipa segments={segments} enclose={false} />}
      </>
    )
  } catch {
    return <></>
  }
}
