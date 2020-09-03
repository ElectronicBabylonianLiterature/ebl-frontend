import replaceTransliteration from './replaceTransliteration'

test('Replaces transliteration', () => {
  const transliteration =
    'LI23 cí-s,a-pèl-t,a3 |3×AN| NAGA@180 9(ILIMMU2) ÀMA.KÚR.MEC 8 SZUR ⸢kur⸣'
  const replaceInput = replaceTransliteration(transliteration)
  const replacedTransliteration =
    'LI₂₃ ši₂-ṣa-pel₃-ṭa₃ |3×AN| NAGA@180 9(ILIMMU₂) AMA₃.KUR₂.MEŠ 8 ŠUR kur'
  expect(replaceInput).toEqual(replacedTransliteration)
})
