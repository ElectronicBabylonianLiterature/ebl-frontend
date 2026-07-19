import {
  EntityType,
  RealiaInfoEntry,
} from 'fragmentarium/ui/text-annotation/EntityType'
import {
  AnnotationSpan,
  isRealiaAnnotationSpan,
  REALIA_INDICATOR_CLASS,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import {
  getEntryEntityType,
  getMappedEntityType,
} from 'fragmentarium/ui/text-annotation/realiaTypeMapping'
import { RealiaEntry } from 'realia/domain/RealiaEntry'

export interface RealiaDisplayInfo {
  readonly lemma: string
  readonly entityType: EntityType | null
}

export type RealiaInfoLookup = ReadonlyMap<string, RealiaDisplayInfo>

export const emptyRealiaInfoLookup: RealiaInfoLookup = new Map()

export const emptyRealiaInfoEntries: readonly RealiaInfoEntry[] = []

export function toRealiaDisplayInfo(entry: RealiaEntry): RealiaDisplayInfo {
  return { lemma: entry.id, entityType: getEntryEntityType(entry) }
}

export function toRealiaDisplayInfoEntry(
  entry: RealiaInfoEntry,
): RealiaDisplayInfo {
  return { lemma: entry.lemma, entityType: getMappedEntityType(entry.type) }
}

export function buildRealiaInfoLookup(
  entries: readonly RealiaInfoEntry[],
): RealiaInfoLookup {
  return new Map(
    entries.map((entry) => [entry.realiaId, toRealiaDisplayInfoEntry(entry)]),
  )
}

export function getRealiaLabel(
  lookup: RealiaInfoLookup,
  realiaId: string,
): string {
  return lookup.get(realiaId)?.lemma || realiaId
}

export function getRealiaIndicatorClass(
  lookup: RealiaInfoLookup,
  realiaId: string,
): string {
  const entityType = lookup.get(realiaId)?.entityType
  return entityType ? `named-entity__${entityType}` : REALIA_INDICATOR_CLASS
}

export function getSpanLabel(
  lookup: RealiaInfoLookup,
  span: AnnotationSpan,
): string {
  return isRealiaAnnotationSpan(span)
    ? getRealiaLabel(lookup, span.realiaId)
    : span.name
}

export function getSpanIndicatorClass(
  lookup: RealiaInfoLookup,
  span: AnnotationSpan,
): string {
  return isRealiaAnnotationSpan(span)
    ? getRealiaIndicatorClass(lookup, span.realiaId)
    : `named-entity__${span.type}`
}
