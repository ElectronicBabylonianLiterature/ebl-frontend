import { NamedSign, Token, ValueToken } from 'fragmentarium/domain/text'

const graveAccent = '\u0300'
const acuteAccent = '\u0301'
const breve = '\u032E'
const vowels: readonly string[] = ['a', 'e', 'i', 'u', 'A', 'E', 'I', 'U']

function isValueToken(token: Token): token is ValueToken {
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
class Accumulator {
  isSubIndexConverted = false
  isFirstWovel = true
  tokens: Token[] = []
  private subIndex: number | null | undefined

  constructor(subIndex: number | null | undefined) {
    this.subIndex = subIndex
  }

  addToken(token: Token): Accumulator {
    this.tokens.push(
      isValueToken(token)
        ? {
            ...token,
            value: this.addAccentsToValue(token.value)
          }
        : token
    )
    return this
  }

  private addAccentsToValue(value: string): string {
    const letters: string[] = []
    for (const letter of value) {
      if (this.isFirstWovel && this.subIndex === 2 && isVowel(letter)) {
        letters.push(addAcuteAccent(letter))
        this.isFirstWovel = false
        this.isSubIndexConverted = true
      } else if (this.isFirstWovel && this.subIndex === 3 && isVowel(letter)) {
        letters.push(addGraveAccent(letter))
        this.isFirstWovel = false
        this.isSubIndexConverted = true
      } else if (letter === 'h') {
        letters.push(addBreve(letter))
      } else {
        letters.push(letter)
      }
    }
    return letters.join('')
  }
}

export default function addAccents(
  namedSign: NamedSign
): readonly [readonly Token[], boolean] {
  const { tokens, isSubIndexConverted } = namedSign.nameParts.reduce(
    (acc, token) => acc.addToken(token),
    new Accumulator(namedSign.subIndex)
  )

  return [tokens, isSubIndexConverted]
}
