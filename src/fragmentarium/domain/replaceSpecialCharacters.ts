import escapeRegExp from './escapeRegExp'

const consonantsBasic = {
  sz: 'š',
  's,': 'ṣ',
  ş: 'ṣ',
  't,': 'ṭ',
  SZ: 'Š',
  'S,': 'Ṣ',
  Ş: 'Ṣ',
  'T,': 'Ṭ',
}

const consonantsExtended = {
  c: 'š',
  C: 'Š',
  ḫ: 'h',
  j: 'g',
  ŋ: 'g',
  ĝ: 'g',
  g̃: 'g',
  Ḫ: 'H',
  J: 'G',
  Ŋ: 'G',
  G̃: 'G',
  Ĝ: 'G',
  "'": 'ʾ',
}

const vowels = {
  aa: 'ā',
  ee: 'ē',
  ii: 'ī',
  uu: 'ū',
  āa: 'â',
  ēe: 'ê',
  īi: 'î',
  ūu: 'û',
  AA: 'Ā',
  aA: 'Ā',
  EE: 'Ē',
  eE: 'Ē',
  II: 'Ī',
  iI: 'Ī',
  UU: 'Ū',
  uU: 'Ū',
  ĀA: 'â',
  āA: 'â',
  ĒE: 'ê',
  ēE: 'ê',
  ĪI: 'î',
  īI: 'î',
  ŪU: 'û',
  ūU: 'û',
}

export default function replaceSpecialCharacters(
  replaceVowels: boolean,
  replaceConsonantsExtended: boolean,
  userInput: string,
): string {
  const characters = {
    ...consonantsBasic,
    ...(replaceVowels && vowels),
    ...(replaceConsonantsExtended && consonantsExtended),
  }
  const specialCharacters = escapeRegExp(Object.keys(characters))
  const regExp = new RegExp(specialCharacters, 'g')
  return userInput.replace(regExp, (match) => characters[match] || match)
}
