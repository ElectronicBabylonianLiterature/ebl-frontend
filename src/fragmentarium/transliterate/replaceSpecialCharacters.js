const characters = {
  '\\A': 'Ā',
  '\\a': 'ā',
  '\\E': 'Ē',
  '\\e': 'ē',
  '\\I': 'Ī',
  '\\i': 'ī',
  '\\U': 'Ū',
  '\\u': 'ū',
  '\\^A': 'Â',
  '\\^a': 'â',
  '\\^E': 'Ê',
  '\\^e': 'ê',
  '\\^I': 'Î',
  '\\^i': 'î',
  '\\^U': 'Û',
  '\\^u': 'û',
  '\\vS': 'Š',
  '\\vs': 'š',
  '\\S,': 'Ṣ',
  '\\s,': 'ṣ',
  '\\T': 'Ṭ',
  '\\t': 'ṭ',
  '\\\'': 'ʾ',
  '\\G': 'Ĝ',
  '\\g': 'ĝ',
  '\\1': '₁',
  '\\2': '₂',
  '\\3': '₃',
  '\\4': '₄',
  '\\5': '₅',
  '\\6': '₆',
  '\\7': '₇',
  '\\8': '₈',
  '\\9': '₉',
  '\\0': '₀',
  '\\x': 'ₓ'
}

function replaceSpecialCharacters (userInput) {
  return userInput.replace(/\\(\^|v|)?(\w|'),?/g, match => characters[match] || match)
}

export default replaceSpecialCharacters
