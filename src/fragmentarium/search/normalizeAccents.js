import _ from 'lodash'
import charactersWithAccents from './charactersWithAccents.json'

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

      const characterWithoutAccent = match.split('').map(character => {
        return charactersWithAccents.hasOwnProperty(character)
          ? charactersWithAccents[character].letter
          : character
      })

      return characterWithoutAccent.concat(subindex).join('')
    })
}
