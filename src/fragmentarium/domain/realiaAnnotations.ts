import { RealiaNamedEntity } from 'fragmentarium/ui/text-annotation/EntityType'
import { Token } from 'transliteration/domain/token'
import { isAnyWord } from 'transliteration/domain/type-guards'

export type RealiaIdLookup = ReadonlyMap<string, string>

export const emptyRealiaIdLookup: RealiaIdLookup = new Map()

export function createRealiaIdLookup(
  realia: ReadonlyArray<RealiaNamedEntity> = [],
): RealiaIdLookup {
  return new Map(realia.map(({ id, realiaId }) => [id, realiaId]))
}

export function getTokenRealiaIds(
  lookup: RealiaIdLookup,
  token: Token,
): readonly string[] {
  if (!isAnyWord(token)) {
    return []
  }
  return (token.realia ?? [])
    .map((annotationId) => lookup.get(annotationId))
    .filter((realiaId): realiaId is string => realiaId !== undefined)
}
