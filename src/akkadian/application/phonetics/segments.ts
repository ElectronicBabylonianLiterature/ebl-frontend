import {
  Syllable,
  getSyllables,
} from 'akkadian/application/phonetics/syllables'

interface Segment {
  readonly transcription: string
  readonly ipa: string
  readonly syllables: Syllable[]
  readonly stress: number
}

export function transcriptionToPhoneticSegments(
  transcription: string
): Segment {
  const syllables = getSyllables(transcription)
  return {
    transcription: transcription,
    syllables: syllables,
    ipa: syllables.map((syllable) => syllable.ipa).join('.'),
    stress: syllables.findIndex((syllable) => syllable.isStressed),
  }
}

/*
  ToDo:
  - Refactor to different files
  - Write tests
  - Remove excessive exports
  - Implement UI components
  - Link to application (corpus, dictionary etc.)
  */

console.log(transcriptionToPhoneticSegments('iprus'))
console.log(transcriptionToPhoneticSegments('iparras'))
console.log(transcriptionToPhoneticSegments('purrusû'))
console.log(transcriptionToPhoneticSegments('purrusûm'))
console.log(transcriptionToPhoneticSegments("purrusā'u"))
console.log(transcriptionToPhoneticSegments('awīlum'))
console.log(transcriptionToPhoneticSegments('amēlu'))
