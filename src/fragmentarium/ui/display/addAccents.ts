import { NamedSign, Token } from 'fragmentarium/domain/text'

const graveAccent = '\u0300'
const acuteAccent = '\u0301'
const breve = '\u032E'
const vowels: readonly string[] = ['a', 'e', 'i', 'u', 'A', 'E', 'I', 'U']

function isValueToken(token: Token): boolean {
  return token.type === 'ValueToken'
}

function isVowel(letter: string): boolean {
  return vowels.includes(letter)
}

function addGraveAccent(letter: string): string {
  return `${letter}${graveAccent}`
}

function addAcuteAccent(letter: string): string {
  return `${letter}${acuteAccent}`
}

function addBreve(letter: string): string {
  return `${letter}${breve}`
}

export default function addAccents(
  namedSign: NamedSign
): readonly [readonly Token[], boolean] {
  let omitSubindex = false
  let firstVowel = true

  function addAccentsToValue(value: string): string {
    const letters: string[] = []
    for (const letter of value) {
      if (firstVowel && namedSign.subIndex === 2 && isVowel(letter)) {
        letters.push(addAcuteAccent(letter))
        firstVowel = false
        omitSubindex = true
      } else if (firstVowel && namedSign.subIndex === 3 && isVowel(letter)) {
        letters.push(addGraveAccent(letter))
        firstVowel = false
        omitSubindex = true
      } else if (letter === 'h') {
        letters.push(addBreve(letter))
      } else {
        letters.push(letter)
      }
    }
    return letters.join('')
  }

  const tokens = namedSign.nameParts.map(token =>
    isValueToken(token)
      ? {
          ...token,
          value: addAccentsToValue(token.value)
        }
      : token
  )

  return [tokens, omitSubindex]
}
