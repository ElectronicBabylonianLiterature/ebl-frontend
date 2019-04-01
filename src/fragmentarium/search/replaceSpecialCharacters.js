import _ from 'lodash'

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
  const specialCharacters = Object.keys(characters)
    .map(character => {
      return _.escapeRegExp(character)
    })
    .join('|')
  const regExp = new RegExp(specialCharacters, 'g')
  return userInput.replace(regExp, match => characters[match] || match)
}
