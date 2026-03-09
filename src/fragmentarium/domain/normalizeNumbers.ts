import specialTransliterationCharacters from './specialTransliterationCharacters.json'
import escapeRegExp from './escapeRegExp'

function convertNumbers(number) {
  const numbers = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
  }

  const numberAsArray = number.split('')

  return numberAsArray
    .map((number) => {
      return numbers[number]
    })
    .join('')
}

function replacer(match, characters, numbers) {
  const convertedNumbers = convertNumbers(numbers)
  return [characters, convertedNumbers].join('')
}

export default function normalizeNumbers(userInput: string): string {
  const specialTransliterationCharactersAsString = escapeRegExp(
    specialTransliterationCharacters,
  )
  const regExp = new RegExp(
    `(\\D\\B|${specialTransliterationCharactersAsString})(\\d+)`,
    'g',
  )
  return userInput.replace(regExp, replacer)
}
