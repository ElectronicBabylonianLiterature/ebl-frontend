import charactersWithAccents from './charactersWithAccents.json'
import specialTransliterationCharacters from './specialTransliterationCharacters.json'
import escapeRegExp from './escapeRegExp'

const charactersWithAccentsAsString = escapeRegExp(
  Object.keys(charactersWithAccents)
)

const specialTransliterationCharactersAsString = escapeRegExp(
  specialTransliterationCharacters
)

const spaceCharacters = '[^\\{\\}\\-\\.:,\\+\\s\\n]'

const accentExpression = new RegExp(
  `(${charactersWithAccentsAsString})(${specialTransliterationCharactersAsString}|)${spaceCharacters}*`,
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

    // Check if the characterWithoutAccent contains an index
    const index = subindex.length > 0 ? subindex.join('') : ''

    return characterWithoutAccent.concat(index).join('')
  })
}
