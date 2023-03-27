import { SyllableWeight } from 'akkadian/application/phonetics/syllables'

enum SyllableLengthMeter {
  SHORT = '⏑',
  LONG = '—',
  EXTRALONG = '⏗',
}

const ICTUS = '◌́ '

interface SyllableMeter {
  length: SyllableLengthMeter
  ictus: boolean
}

export function syllableToMeter(
  weight: SyllableWeight,
  isStressed: boolean
): string {
  const syllableMeter: SyllableMeter = {
    length: [
      SyllableLengthMeter.SHORT,
      SyllableLengthMeter.LONG,
      SyllableLengthMeter.EXTRALONG,
    ][weight],
    ictus: isStressed,
  }
  return `${syllableMeter.length}${syllableMeter.ictus ? ICTUS[1] : ''}`
}
