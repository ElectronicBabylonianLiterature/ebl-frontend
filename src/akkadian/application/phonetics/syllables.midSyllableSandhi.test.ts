import {
  getSyllables,
  SyllableStructure,
} from 'akkadian/application/phonetics/syllables'

const midSyllableSandhi = {
  formOverride: {
    initialForm: 'ina',
    overrideForm: 'ina',
    isMidSyllableSandhi: true,
  },
}

it('keeps a mid-syllable sandhi form as a single syllable', () => {
  const [syllable, ...rest] = getSyllables('an', midSyllableSandhi)
  expect(rest).toEqual([])
  expect(syllable.structure).toEqual(SyllableStructure.VC)
})

it('rejects a mid-syllable sandhi form that is not one syllable', () => {
  expect(() => getSyllables('ina', midSyllableSandhi)).toThrow(
    'Unknown type of syllable structure for "ina" (likely invalid).',
  )
})
