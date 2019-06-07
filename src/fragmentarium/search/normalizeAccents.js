import charactersWithAccents from './charactersWithAccents.json'
import specialTransliterationCharacters from './specialTransliterationCharacters.json'
import escapeRegExp from './escapeRegExp.js'

const charactersWithAccentsAsString = escapeRegExp(
  Object.keys(charactersWithAccents)
)

const specialTransliterationCharactersAsString = escapeRegExp(
  specialTransliterationCharacters
)

const accentExpression = new RegExp(
  `(${charactersWithAccentsAsString})(${specialTransliterationCharactersAsString}|)\\w*`,
  'g'
)

export default function normalizeAccents(userInput) {
  return userInput.replace(accentExpression, match => {
    const subindex = match
      .split('')
      .map(character =>
        charactersWithAccents.hasOwnProperty(character)
          ? charactersWithAccents[character].index
          : null
      )

    const characterWithoutAccent = match
      .split('')
      .map(character =>
        charactersWithAccents.hasOwnProperty(character)
          ? charactersWithAccents[character].letter
          : character
      )

    return characterWithoutAccent.concat(subindex).join('')
  })
}
