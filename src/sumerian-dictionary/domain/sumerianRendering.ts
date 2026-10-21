import _ from 'lodash'
import {
  Rendering,
  SumerianSource,
  UnrenderedToken,
} from 'sumerian-dictionary/domain/SumerianWordParts'

export interface CuneiformPiece {
  readonly kind: 'sign' | 'missing'
  readonly value: string
}

export interface SpellingCuneiform {
  readonly complete: string
  readonly partial: readonly CuneiformPiece[]
  readonly knownWrongCharacters: readonly string[]
}

const placeholders = new Set(['?', 'X'])
const completeSeparator = ' / '

function renderingSpellings(rendering: Rendering): readonly string[] {
  const spelling = rendering.spelling.trim()
  return _.uniq([spelling, rendering.printed.trim() || spelling])
}

function rendersSpelling(
  rendering: Rendering,
  source: SumerianSource,
  spelling: string,
): boolean {
  return (
    rendering.source === source &&
    renderingSpellings(rendering).includes(spelling.trim())
  )
}

function isShownComplete(rendering: Rendering): boolean {
  return rendering.complete && rendering.cuneiform.length > 0
}

function unrenderedTokenText({ token, reason }: UnrenderedToken): string {
  return reason === 'noCharacter' && token.length === 1
    ? token.toLowerCase()
    : token
}

function appendPiece(
  pieces: readonly CuneiformPiece[],
  piece: CuneiformPiece,
): readonly CuneiformPiece[] {
  const last = _.last(pieces)
  return last && last.kind === 'sign' && piece.kind === 'sign'
    ? [
        ...pieces.slice(0, -1),
        { kind: 'sign', value: last.value + piece.value },
      ]
    : [...pieces, piece]
}

function placePieces(
  characters: readonly string[],
  tokens: readonly string[],
): readonly CuneiformPiece[] {
  return characters.reduce<{
    pieces: readonly CuneiformPiece[]
    next: number
  }>(
    ({ pieces, next }, character) =>
      placeholders.has(character)
        ? {
            pieces: appendPiece(pieces, {
              kind: 'missing',
              value: tokens[next],
            }),
            next: next + 1,
          }
        : {
            pieces: appendPiece(pieces, { kind: 'sign', value: character }),
            next,
          },
    { pieces: [], next: 0 },
  ).pieces
}

export function getPartialPieces(
  rendering: Rendering,
): readonly CuneiformPiece[] | null {
  const characters = Array.from(rendering.cuneiform[0] ?? '')
  const signs = characters.filter((character) => !placeholders.has(character))
  if (signs.length === 0) {
    return null
  }
  const tokens = _.uniq(
    rendering.unrendered.map(unrenderedTokenText).filter(Boolean),
  )
  const marks = characters.length - signs.length
  if (marks === tokens.length) {
    return placePieces(characters, tokens)
  }
  const signPiece: CuneiformPiece = { kind: 'sign', value: signs.join('') }
  return tokens.length > 0
    ? [signPiece, { kind: 'missing', value: tokens.join(' ') }]
    : [signPiece]
}

export function getSpellingCuneiform(
  renderings: readonly Rendering[],
  source: SumerianSource,
  spelling: string,
): SpellingCuneiform {
  const matching = renderings.filter((rendering) =>
    rendersSpelling(rendering, source, spelling),
  )
  const complete = matching.filter(isShownComplete)
  if (complete.length > 0) {
    return {
      complete: _.uniq(
        complete.map((rendering) => rendering.cuneiform[0]),
      ).join(completeSeparator),
      partial: [],
      knownWrongCharacters: _.uniq(
        complete.flatMap((rendering) => rendering.knownWrongCharacters),
      ),
    }
  }
  const partial = matching
    .map((rendering) => ({ rendering, pieces: getPartialPieces(rendering) }))
    .find(({ pieces }) => pieces !== null)
  return {
    complete: '',
    partial: partial?.pieces ?? [],
    knownWrongCharacters: partial?.rendering.knownWrongCharacters ?? [],
  }
}

export function getKeyRenderingSpellings(
  renderings: readonly Rendering[],
): readonly string[] {
  return _.uniq(
    renderings
      .filter((rendering) => rendering.kind === 'key')
      .map((rendering) => rendering.spelling),
  )
}

export function getHeadCuneiform({
  renderings,
  citationForm,
}: {
  renderings: readonly Rendering[]
  citationForm: string
}): string {
  const key = renderings.find(
    (rendering) => rendering.kind === 'key' && isShownComplete(rendering),
  )
  return key
    ? key.cuneiform[0]
    : getSpellingCuneiform(renderings, 'epsd2', citationForm).complete
}
