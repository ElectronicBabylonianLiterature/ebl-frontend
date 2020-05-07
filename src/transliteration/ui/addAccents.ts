import { NamedSign, Token, ValueToken } from 'transliteration/domain/token'

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
            value: this.addAccentsToValue(token.value),
          }
        : token
    )
    return this
  }

  private addAccentsToValue(value: string): string {
    return value
      .split('')
      .map((letter) => this.visitLetter(letter))
      .join('')
  }

  private visitLetter(letter: string): string {
    if (this.isFirstWovel && isVowel(letter)) {
      return this.visitVowel(letter)
    } else if (letter === 'h') {
      return addBreve(letter)
    } else {
      return letter
    }
  }

  private visitVowel(vowel: string): string {
    if (this.subIndex === 2) {
      this.isFirstWovel = false
      this.isSubIndexConverted = true
      return addAcuteAccent(vowel)
    } else if (this.subIndex === 3) {
      this.isFirstWovel = false
      this.isSubIndexConverted = true
      return addGraveAccent(vowel)
    } else {
      return vowel
    }
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
