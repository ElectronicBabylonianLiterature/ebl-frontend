const characters = {
  'c': 'š',
  'sz': 'š',
  's,': 'ṣ',
  'ş': 'ṣ',
  't,': 'ṭ',
  'ḫ': 'h',
  'j': 'g',
  'ŋ': 'g',
  'ĝ': 'g',
  'g̃': 'g',
  'C': 'Š',
  'SZ': 'Š',
  'S,': 'Ṣ',
  'Ş': 'Ṣ',
  'T,': 'Ṭ',
  'Ḫ': 'H',
  'J': 'G',
  'Ŋ': 'G',
  'G̃': 'G',
  'Ĝ': 'G'
}

export default function replaceSpecialCharacters (userInput) {
  return userInput.replace(/c|sz|s,|ş|t,|ḫ|j|ŋ|ĝ|g̃|C|SZ|S,|Ş|T,|Ḫ|J|Ŋ|G̃|Ĝ/g, match => characters[match] || match)
}
