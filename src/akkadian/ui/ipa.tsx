import React from 'react'
import transcriptionToIpa from 'akkadian/phonetics/ipa'

export default function Ipa(transcription: string): JSX.Element {
  return <span>{transcriptionToIpa(transcription)}</span>
}
