import {
  AnnotationSpans,
  DerivedAnnotationSpans,
  entitySpanName,
  NAMED_ENTITY_LAYER,
  REALIA_LAYER,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import _ from 'lodash'

type SpanBoundaries = readonly { id: string; span: readonly string[] }[]

function createSpanBoundaryMaps(
  spans: SpanBoundaries,
): [Map<string, string[]>, Map<string, string[]>] {
  const spanStarts = new Map<string, string[]>()
  const spanEnds = new Map<string, string[]>()

  _.sortBy(spans, ({ span }) => -span.length).forEach(({ span, id }) => {
    const start = span[0]
    const end = span[span.length - 1]

    spanStarts.set(start, [...(spanStarts.get(start) || []), id])
    spanEnds.set(end, [...(spanEnds.get(end) || []), id])
  })

  return [spanStarts, spanEnds]
}

function getLowestOpenTier(occupiedTiers: number[]): number {
  let tier = 1
  while (occupiedTiers.includes(tier)) {
    tier++
  }
  return tier
}

function computeLayerTiers(
  words: readonly string[],
  spans: SpanBoundaries,
): Map<string, number> {
  const [spanStarts, spanEnds] = createSpanBoundaryMaps(spans)

  const tiers = new Map<string, number>()
  const tierQueue = new Map<string, number>()
  const popStack = new Set<string>()

  words.forEach((wordId) => {
    popStack.forEach((spanId) => tierQueue.delete(spanId))
    popStack.clear()
    spanStarts.get(wordId)?.forEach((spanId) => {
      if (!tierQueue.has(spanId)) {
        const openTier = getLowestOpenTier([...tierQueue.values()])

        tierQueue.set(spanId, openTier)
        tiers.set(spanId, openTier)
      }
    })
    spanEnds.get(wordId)?.forEach((spanId) => popStack.add(spanId))
  })

  return tiers
}

export function setTiers(
  words: readonly string[],
  spans: AnnotationSpans,
): DerivedAnnotationSpans {
  const entityTiers = computeLayerTiers(words, spans.namedEntities)
  const realiaTiers = computeLayerTiers(words, spans.realia)
  const entityDepth = _.max([...entityTiers.values()]) || 0

  return {
    namedEntities: spans.namedEntities.map((span) => ({
      ...span,
      layer: NAMED_ENTITY_LAYER,
      tier: entityTiers.get(span.id) || 1,
      name: entitySpanName(span),
    })),
    realia: spans.realia.map((span) => ({
      ...span,
      layer: REALIA_LAYER,
      tier: entityDepth + (realiaTiers.get(span.id) || 1),
      name: span.realiaId,
    })),
  }
}
