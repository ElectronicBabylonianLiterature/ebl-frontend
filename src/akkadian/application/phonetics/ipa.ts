import { transcriptionToIpaMap } from 'akkadian/domain/transcription/transcription'

export function transcriptionToIpa(
  transcription: string,
  isSyllableStressed: boolean
): string {
  const ipa = Object.entries(transcriptionToIpaMap).reduce(
    (prev, entry) => prev.replace(...entry),
    transcription
  )
  return isSyllableStressed ? ipa.replace(/[a|e|i|u][:]*/g, "$&'") : ipa
}
