import { transcriptionToIpaMap } from 'akkadian/domain/transcription/transcription'

export interface IpaProps {
  isStressed?: boolean
  isAffricative?: boolean
  isPharyngealized?: boolean
}

function getIpaMap(isAffricative: boolean, isPharyngealized: boolean) {
  let IpaMap = transcriptionToIpaMap.basic
  if (isAffricative) {
    IpaMap = {
      ...IpaMap,
      ...transcriptionToIpaMap.affricative,
    }
  }
  if (isPharyngealized) {
    IpaMap = {
      ...IpaMap,
      ...transcriptionToIpaMap.pharyngealized,
    }
  }
  if (isAffricative && isPharyngealized) {
    IpaMap = {
      ...IpaMap,
      ...transcriptionToIpaMap['pharyngealized-affricative'],
    }
  }
  return IpaMap
}

export function transcriptionToIpa(
  transcription: string,
  options: IpaProps = {
    isStressed: false,
    isAffricative: false,
    isPharyngealized: false,
  },
): string {
  const map = getIpaMap(
    options.isAffricative ?? false,
    options.isPharyngealized ?? false,
  )
  const ipa = Object.entries(map).reduce(
    (prev, entry) => prev.replace(...entry),
    transcription,
  )
  return options.isStressed ? `ˈ${ipa}` : ipa
}
