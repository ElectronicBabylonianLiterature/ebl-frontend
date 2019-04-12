import charactersWithAccents from './charactersWithAccents.json'
import specialTransliterationCharacters from './specialTransliterationCharacters.json'
import escapeRegExp from './escapeRegExp.js'

export default function normalizeAccents (userInput) {
  const charactersWithAccentsAsString = escapeRegExp(Object.keys(charactersWithAccents))

  const specialTransliterationCharactersAsString = escapeRegExp(specialTransliterationCharacters)

  const regExp = new RegExp(`(${charactersWithAccentsAsString})(${specialTransliterationCharactersAsString}|)\\w*`, 'g')

  return userInput.replace(regExp,
    match => {
      const subindex = match.split('').map(character =>
        charactersWithAccents.hasOwnProperty(character)
          ? charactersWithAccents[character].index
          : null
      )

      const characterWithoutAccent = match.split('').map(character =>
        charactersWithAccents.hasOwnProperty(character)
          ? charactersWithAccents[character].letter
          : character
      )

      return characterWithoutAccent.concat(subindex).join('')
    })
}
