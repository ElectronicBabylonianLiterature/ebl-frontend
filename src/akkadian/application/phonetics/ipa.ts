import { transcriptionToIpaMap } from 'akkadian/domain/transcription/transcription'

function getIpaMap(affricative: boolean, pharyngealized: boolean) {
  let IpaMap = transcriptionToIpaMap.basic
  if (affricative) {
    IpaMap = {
      ...IpaMap,
      ...transcriptionToIpaMap.affricative,
    }
  }
  if (pharyngealized) {
    IpaMap = {
      ...IpaMap,
      ...transcriptionToIpaMap.pharyngealized,
    }
  }
  if (affricative && pharyngealized) {
    IpaMap = {
      ...IpaMap,
      ...transcriptionToIpaMap['pharyngealized-affricative'],
    }
  }
  return IpaMap
}

export function transcriptionToIpa(
  transcription: string,
  isSyllableStressed = false,
  affricative = false,
  pharyngealized = false
): string {
  const map = getIpaMap(affricative, pharyngealized)
  const ipa = Object.entries(map).reduce(
    (prev, entry) => prev.replace(...entry),
    transcription
  )
  return isSyllableStressed ? ipa.replace(/[a|e|i|u][:]*/g, "$&'") : ipa
}
