import _ from 'lodash'

const charactersWithAccents = {
  'á': { 'letter': 'a', 'index': '₂' },
  'à': { 'letter': 'a', 'index': '₃' },
  'é': { 'letter': 'e', 'index': '₂' },
  'è': { 'letter': 'e', 'index': '₃' },
  'í': { 'letter': 'i', 'index': '₂' },
  'ì': { 'letter': 'i', 'index': '₃' },
  'ú': { 'letter': 'u', 'index': '₂' },
  'ù': { 'letter': 'u', 'index': '₃' },
  'Á': { 'letter': 'A', 'index': '₂' },
  'À': { 'letter': 'A', 'index': '₃' },
  'É': { 'letter': 'E', 'index': '₂' },
  'È': { 'letter': 'E', 'index': '₃' },
  'Í': { 'letter': 'I', 'index': '₂' },
  'Ì': { 'letter': 'I', 'index': '₃' },
  'Ú': { 'letter': 'U', 'index': '₂' },
  'Ù': { 'letter': 'U', 'index': '₃' }
}

export default function normalizeAccents (userInput) {
  const specialCharacters = Object.keys(charactersWithAccents)
    .map(character => {
      return _.escapeRegExp(character)
    })
    .join('|')

  const regExp = new RegExp(`(${specialCharacters})\\w*`, 'g')

  return userInput.replace(regExp,
    match => {
      const subindex = match.split('').map(character => {
        return charactersWithAccents.hasOwnProperty(character)
          ? charactersWithAccents[character].index
          : null
      })

      const withoutAccent = match.split('').map(character => {
        return charactersWithAccents.hasOwnProperty(character)
          ? charactersWithAccents[character].letter
          : character
      })

      return withoutAccent.concat(subindex).join('')
    })
}
