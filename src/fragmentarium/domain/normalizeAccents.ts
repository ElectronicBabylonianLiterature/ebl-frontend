import charactersWithAccents from './charactersWithAccents.json'
import specialTransliterationCharacters from './specialTransliterationCharacters.json'
import escapeRegExp from './escapeRegExp'

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

export default function normalizeAccents(userInput: string): string {
  return userInput.replace(accentExpression, (match) => {
    const subindex = match
      .split('')
      .map((character) => charactersWithAccents[character]?.index)

    const characterWithoutAccent = match
      .split('')
      .map((character) => charactersWithAccents[character]?.letter ?? character)

    return characterWithoutAccent.concat(subindex).join('')
  })
}
