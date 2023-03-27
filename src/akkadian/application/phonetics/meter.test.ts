import { syllableToMeter } from 'akkadian/application/phonetics/meter'
import { SyllableWeight } from 'akkadian/application/phonetics/syllables'

test.each([
  [SyllableWeight.LIGHT, false, '⏑'],
  [SyllableWeight.HEAVY, false, '—'],
  [SyllableWeight.SUPERHEAVY, false, '⏗'],
  [SyllableWeight.LIGHT, true, '⏑́'],
  [SyllableWeight.HEAVY, true, '—́'],
  [SyllableWeight.SUPERHEAVY, true, '⏗́'],
])('Converts syllable to meter', (weight, isStressed, expected) => {
  expect(syllableToMeter(weight, isStressed)).toEqual(expected)
})
