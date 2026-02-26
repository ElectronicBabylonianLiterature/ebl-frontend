import { Weight } from 'akkadian/application/phonetics/syllables'

export interface MeterProps {
  useJunicode?: boolean
}

enum SyllableLengthMeter {
  SHORT = '⏑',
  LONG = '—',
  EXTRALONG = '⏗',
}

const ICTUS = '◌́'[1]

const JunicodeMeter = {
  [SyllableLengthMeter.SHORT + ICTUS]: '',
  [SyllableLengthMeter.LONG]: '',
  [SyllableLengthMeter.LONG + ICTUS]: '',
}

interface SyllableMeter {
  length: SyllableLengthMeter
  ictus: boolean
}

export function syllableToMeter(
  weight: Weight,
  isStressed: boolean,
  options: MeterProps = { useJunicode: true },
): string {
  const syllableMeter: SyllableMeter = {
    length: [
      SyllableLengthMeter.SHORT,
      SyllableLengthMeter.LONG,
      SyllableLengthMeter.EXTRALONG,
    ][weight],
    ictus: isStressed,
  }
  const unicodeMeter = `${syllableMeter.length}${
    syllableMeter.ictus ? ICTUS : ''
  }`
  return options.useJunicode &&
    Object.keys(JunicodeMeter).includes(unicodeMeter)
    ? JunicodeMeter[unicodeMeter]
    : unicodeMeter
}
