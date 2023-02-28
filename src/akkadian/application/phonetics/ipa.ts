import { transcriptionToIpaMap } from 'akkadian/domain/transcription/transcription'

export interface IpaOptions {
  isSyllableStressed?: boolean
  affricative?: boolean
  pharyngealized?: boolean
}

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
  options: IpaOptions = {
    isSyllableStressed: false,
    affricative: false,
    pharyngealized: false,
  }
): string {
  const map = getIpaMap(
    options.affricative ?? false,
    options.pharyngealized ?? false
  )
  const ipa = Object.entries(map).reduce(
    (prev, entry) => prev.replace(...entry),
    transcription
  )
  return options.isSyllableStressed ? ipa.replace(/[a|e|i|u][:]*/g, "$&'") : ipa
}
