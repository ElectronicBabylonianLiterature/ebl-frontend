import {
  AkkadianWord,
  NamedSign,
  Token,
  ValueToken,
} from 'transliteration/domain/token'

const vowels: ReadonlySet<string> = new Set([
  'a',
  'e',
  'i',
  'u',
  'A',
  'E',
  'I',
  'U',
])
const acuteAccents: ReadonlyMap<string, string> = new Map([
  ['A', '\u00C1'],
  ['E', '\u00C9'],
  ['I', '\u00CD'],
  ['O', '\u00D3'],
  ['U', '\u00DA'],
  ['a', '\u00E1'],
  ['e', '\u00E9'],
  ['i', '\u00ED'],
  ['o', '\u00F3'],
  ['u', '\u00FA'],
])
const graveAccents: ReadonlyMap<string, string> = new Map([
  ['A', '\u00C0'],
  ['E', '\u00C8'],
  ['I', '\u00CC'],
  ['O', '\u00D2'],
  ['U', '\u00D9'],
  ['a', '\u00E0'],
  ['e', '\u00E8'],
  ['i', '\u00EC'],
  ['o', '\u00F2'],
  ['u', '\u00F9'],
])
const breves: ReadonlyMap<string, string> = new Map([
  ['h', '\u1E2B'],
  ['H', '\u1E2A'],
])

function isValueToken(token: Token): token is ValueToken {
  return token.type === 'ValueToken'
}

function isVowel(letter: string): boolean {
  return vowels.has(letter)
}

function addGraveAccent(letter: string): string {
  return graveAccents.get(letter) ?? letter
}

function addAcuteAccent(letter: string): string {
  return acuteAccents.get(letter) ?? letter
}

class Accumulator {
  private isSubIndexConverted = false
  private isFirstWovel = true
  private tokens: Token[] = []

  constructor(private subIndex: number | null | undefined) {}

  get result(): [Token[], boolean] {
    return [this.tokens, this.isSubIndexConverted]
  }

  addToken(token: Token): Accumulator {
    this.tokens.push(
      isValueToken(token)
        ? {
            ...token,
            value: this.addAccentsToValue(token.value),
          }
        : token,
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
    return this.isFirstWovel && isVowel(letter)
      ? this.visitVowel(letter)
      : breves.get(letter) || letter
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

export function addAccents(
  namedSign: NamedSign,
): readonly [readonly Token[], boolean] {
  return namedSign.nameParts.reduce(
    (acc, token) => acc.addToken(token),
    new Accumulator(namedSign.subIndex),
  ).result
}

export function addBreves(word: AkkadianWord): AkkadianWord {
  const regexp = new RegExp([...breves.keys()].join('|'), 'g')
  return {
    ...word,
    parts: word.parts.map((part) =>
      isValueToken(part)
        ? {
            ...part,
            value: part.value.replaceAll(regexp, (c) => breves.get(c) || c),
          }
        : part,
    ),
  }
}
