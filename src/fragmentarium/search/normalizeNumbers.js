
function convertNumbers (number) {
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
    '9': '₉'
  }

  const numberAsArray = number.split('')

  return numberAsArray.map((number) => {
    return numbers[number]
  }).join('')
}

export default function normalizeNumbers (userInput) {
  return userInput.replace(/(?<=\D\B)\d+/g, match => convertNumbers(match) || match)
}
