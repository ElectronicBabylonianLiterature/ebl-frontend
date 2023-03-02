import React from 'react'
import { transcriptionToPhoneticSegments } from 'akkadian/application/phonetics/segments'
import { flattenDeep } from 'lodash'

export default function Ipa(transcriptions: readonly string[]): JSX.Element {
  try {
    const ipaTranscription = flattenDeep(
      transcriptions.map((element) => element.split(/[-| ]/g))
    )
      .map(
        (transcription) =>
          transcriptionToPhoneticSegments(transcription.toLowerCase()).ipa
      )
      .join(' ')
    return <div className="ipa-display">[{ipaTranscription}]</div>
  } catch (error) {
    return <></>
  }
}
