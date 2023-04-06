import { syllableToMeter } from 'akkadian/application/phonetics/meter'
import { SyllableWeight } from 'akkadian/application/phonetics/syllables'

test.each([
  [SyllableWeight.LIGHT, false, '⏑', '⏑'],
  [SyllableWeight.HEAVY, false, '—', ''],
  [SyllableWeight.ULTRAHEAVY, false, '⏗', '⏗'],
  [SyllableWeight.LIGHT, true, '⏑́', ''],
  [SyllableWeight.HEAVY, true, '—́', ''],
  [SyllableWeight.ULTRAHEAVY, true, '⏗́', '⏗́'],
])(
  'Converts syllable to meter',
  (weight, isStressed, expectedUnicode, expectedJunicode) => {
    expect(syllableToMeter(weight, isStressed, { useJunicode: false })).toEqual(
      expectedUnicode
    )
    expect(syllableToMeter(weight, isStressed, { useJunicode: true })).toEqual(
      expectedJunicode
    )
  }
)
