import replaceTransliteration from './replaceTransliteration'

xtest('Replaces transliteration', () => {
  const transliteration = 'LI23 cí-s,a-pèl-t,a3 |3×AN| NAGA@180 9(ILIMMU2) ÀMA.KÚR.MEC 8 SZUR'
  const replaceInput = replaceTransliteration(transliteration)
  const replacedTransliteration = 'LI₂₃ ši₂-ṣa-pel₃-ṭa₃ |3×AN| NAGA@180 9(ILIMMU₂) AMA₃.KUR₂.MEŠ 8 ŠUR'
  expect(replaceInput).toEqual(replacedTransliteration)
})
