const indices = {
  'á': '₂',
  'à': '₃',
  'é': '₂',
  'è': '₃',
  'í': '₂',
  'ì': '₃',
  'ú': '₂',
  'ù': '₃'
}

export default function normalizeAccents (userInput) {
  const charactersWithoutAccents = {
    'á': 'a',
    'à': 'a',
    'é': 'e',
    'è': 'e',
    'í': 'i',
    'ì': 'i',
    'ú': 'u',
    'ù': 'u'
  }
  return userInput.replace(/(á|à|é|è|í|ì|ú|ù)\w?/g, match => {
    const subindex = match.split('').map(character => {
      return indices[character]
    })

    const withoutAccent = match.split('').map(character => {
      return charactersWithoutAccents[character] || character
    })

    return withoutAccent.concat(subindex).join('')
  })
}
