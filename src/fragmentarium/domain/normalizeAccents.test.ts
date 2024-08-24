import normalizeAccents from './normalizeAccents'

test.each([
  ['á', 'a₂'],
  ['pèl', 'pel₃'],
  ['pèṭ', 'peṭ₃'],
  ['5 KUR ák-pú-lu', '5 KUR ak₂-pu₂-lu'],
  ['1: àr-mù', '1: ar₃-mu₃'],
  ['9(ILIMMU)', '9(ILIMMU)'],
  ['NAGA@180', 'NAGA@180'],
  ['|3×AN|', '|3×AN|'],
  ['àma', 'ama₃'],
  ['Á', 'A₂'],
  ['PÈL', 'PEL₃'],
  ['LÚ', 'LU₂'],
  ['ÀMA', 'AMA₃'],
  ['ÀM]A', 'AM]A₃'],
  ['ÀM[A', 'AM[A₃'],
  ['ÀMA.KÚR', 'AMA₃.KUR₂'],
  ['LÌ gí-la-ka₃', 'LI₃ gi₂-la-ka₃'],
])('%s', (character, replacement) => {
  const text = normalizeAccents(character)
  expect(text).toEqual(replacement)
})
