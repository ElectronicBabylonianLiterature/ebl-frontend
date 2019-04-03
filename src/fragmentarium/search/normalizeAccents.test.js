import normalizeAccents from './normalizeAccents'

test.each([
  ['á', 'a₂'],
  ['pèl', 'pel₃'],
  ['5 KUR ák-pú-lu', '5 KUR ak₂-pu₂-lu'],
  ['1: àr-mù', '1: ar₃-mu₃'],
  ['9(ILIMMU)', '9(ILIMMU)'],
  ['NAGA@180', 'NAGA@180'],
  ['|3×AN|', '|3×AN|']
])('%s', (character, replacement) => {
  const text = normalizeAccents(character)
  expect(text).toEqual(replacement)
})
