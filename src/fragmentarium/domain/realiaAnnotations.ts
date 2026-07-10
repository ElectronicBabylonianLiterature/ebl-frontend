import { FragmentNamedEntity } from 'fragmentarium/ui/text-annotation/EntityType'
import { hasRealiaId } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { Token } from 'transliteration/domain/token'
import { isAnyWord } from 'transliteration/domain/type-guards'

export type RealiaIdLookup = ReadonlyMap<string, string>

export const emptyRealiaIdLookup: RealiaIdLookup = new Map()

export function createRealiaIdLookup(
  namedEntities: ReadonlyArray<FragmentNamedEntity> = [],
): RealiaIdLookup {
  return new Map(
    namedEntities
      .filter(hasRealiaId)
      .map((namedEntity) => [namedEntity.id, namedEntity.realiaId]),
  )
}

export function getTokenRealiaIds(
  lookup: RealiaIdLookup,
  token: Token,
): readonly string[] {
  if (!isAnyWord(token)) {
    return []
  }
  return (token.namedEntities ?? [])
    .map((entityId) => lookup.get(entityId))
    .filter((realiaId): realiaId is string => realiaId !== undefined)
}
