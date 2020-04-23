import normalizeNumbers from './normalizeNumbers'

test.each([
  ['a2', 'a₂'],
  ['la3', 'la₃'],
  ['ar14', 'ar₁₄'],
  ['pak44', 'pak₄₄'],
  ['ar2-ka10-nu33', 'ar₂-ka₁₀-nu₃₃'],
  ['5 KUR LA3.PA2', '5 KUR LA₃.PA₂'],
  ['1. ar-mu', '1. ar-mu'],
  ['9(ILIMMU5)', '9(ILIMMU₅)'],
  ['NAGA@180', 'NAGA@180'],
  ['|3×AN|', '|3×AN|'],
  ['peṭ2', 'peṭ₂']
])('%s', (character, replacement) => {
  const text = normalizeNumbers(character)
  expect(text).toEqual(replacement)
})
