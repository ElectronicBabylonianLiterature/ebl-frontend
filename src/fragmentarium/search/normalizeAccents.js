import _ from 'lodash'
import charactersWithAccents from './charactersWithAccents.json'
import specialTransliterationCharacters from './specialTransliterationCharacters.json'

export default function normalizeAccents (userInput) {
  const charactersWithAccentsAsString = Object.keys(charactersWithAccents)
    .map(character => {
      return _.escapeRegExp(character)
    })
    .join('|')

  const specialTransliterationCharactersAsString = specialTransliterationCharacters
    .map(character => {
      return _.escapeRegExp(character)
    })
    .join('|')

  const regExp = new RegExp(`(${charactersWithAccentsAsString})(${specialTransliterationCharactersAsString}|)\\w*`, 'g')

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
