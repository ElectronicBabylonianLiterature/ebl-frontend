import normalizeSumerianQuery from 'sumerian-dictionary/domain/normalizeSumerianQuery'

it.each([
  ['szu dug4', 'šu dug₄'],
  [' sza3 ', 'ša₃'],
  ['SZU', 'ŠU'],
  ['s,a3 t,e4', 'ṣa₃ ṭe₄'],
  ['is,-s,ur', 'iṣ-ṣur'],
  ['S,A t,2', 'ṢA ṭ₂'],
  ['ĝeš', 'ĝeš'],
  ['ĝiš,s,ar', 'ĝiš,ṣar'],
  ['{d}s,a', '{d}ṣa'],
  ['du₃-a', 'du₃-a'],
  ['lugal', 'lugal'],
])('writes the transliteration %p as %p', (query, expected) => {
  expect(normalizeSumerianQuery(query)).toEqual(expected)
})

it.each([
  ['fève', 'fève'],
  ['épée', 'épée'],
  ['roi, reine', 'roi, reine'],
  ['gods, kings', 'gods, kings'],
  ['goat, sheep', 'goat, sheep'],
  ['gods,kings', 'gods,kings'],
  ['goat,sheep', 'goat,sheep'],
  ['goats,ears', 'goats,ears'],
  ['cats,and', 'cats,and'],
  ['goat,ears', 'goat,ears'],
  ['roi,et reine', 'roi,et reine'],
  ['sza3,dug4', 'ša₃,dug₄'],
  ['dug4, lugal.', 'dug₄, lugal.'],
])('keeps accents and trailing punctuation in %p', (query, expected) => {
  expect(normalizeSumerianQuery(query)).toEqual(expected)
})
