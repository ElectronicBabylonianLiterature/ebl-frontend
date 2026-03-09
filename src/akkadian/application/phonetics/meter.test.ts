import { syllableToMeter } from 'akkadian/application/phonetics/meter'
import { Weight } from 'akkadian/application/phonetics/syllables'

test.each([
  [Weight.LIGHT, false, '⏑', '⏑'],
  [Weight.HEAVY, false, '—', ''],
  [Weight.ULTRAHEAVY, false, '⏗', '⏗'],
  [Weight.LIGHT, true, '⏑́', ''],
  [Weight.HEAVY, true, '—́', ''],
  [Weight.ULTRAHEAVY, true, '⏗́', '⏗́'],
])(
  'Converts syllable to meter',
  (weight, isStressed, expectedUnicode, expectedJunicode) => {
    expect(syllableToMeter(weight, isStressed, { useJunicode: false })).toEqual(
      expectedUnicode,
    )
    expect(syllableToMeter(weight, isStressed, { useJunicode: true })).toEqual(
      expectedJunicode,
    )
  },
)
