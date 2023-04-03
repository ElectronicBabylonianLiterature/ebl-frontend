import { SyllableWeight } from 'akkadian/application/phonetics/syllables'

export interface MeterOptions {
  useJunicode?: boolean
}

enum SyllableLengthMeter {
  SHORT = '⏑',
  LONG = '',
  EXTRALONG = '⏗',
}

const ICTUS = '◌́' //ToDo: Fix bounding

export const JunicodeMeterWithIctus = {
  [SyllableLengthMeter.SHORT]: '',
  [SyllableLengthMeter.LONG]: '',
}

interface SyllableMeter {
  length: SyllableLengthMeter
  ictus: boolean
}

export function syllableToMeter(
  weight: SyllableWeight,
  isStressed: boolean,
  options: MeterOptions = { useJunicode: true }
): string {
  const syllableMeter: SyllableMeter = {
    length: [
      SyllableLengthMeter.SHORT,
      SyllableLengthMeter.LONG,
      SyllableLengthMeter.EXTRALONG,
    ][weight],
    ictus: isStressed,
  }
  return options.useJunicode &&
    syllableMeter.ictus &&
    Object.keys(JunicodeMeterWithIctus).includes(syllableMeter.length)
    ? JunicodeMeterWithIctus[syllableMeter.length]
    : `${syllableMeter.length}${syllableMeter.ictus ? ICTUS[1] : ''}`
}
