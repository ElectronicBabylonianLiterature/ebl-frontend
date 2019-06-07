import escapeRegExp from './escapeRegExp'

const characters = {
  c: 'š',
  sz: 'š',
  's,': 'ṣ',
  ş: 'ṣ',
  't,': 'ṭ',
  ḫ: 'h',
  j: 'g',
  ŋ: 'g',
  ĝ: 'g',
  g̃: 'g',
  C: 'Š',
  SZ: 'Š',
  'S,': 'Ṣ',
  Ş: 'Ṣ',
  'T,': 'Ṭ',
  Ḫ: 'H',
  J: 'G',
  Ŋ: 'G',
  G̃: 'G',
  Ĝ: 'G',
  "'": 'ʾ'
}

export default function replaceSpecialCharacters(userInput) {
  const specialCharacters = escapeRegExp(Object.keys(characters))
  const regExp = new RegExp(specialCharacters, 'g')
  return userInput.replace(regExp, match => characters[match] || match)
}
