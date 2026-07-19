import {
  annotationSpanName,
  ApiEntityAnnotationSpan,
  ApiRealiaAnnotationSpan,
  createAnnotationSpanId,
  dedupeEntitySpans,
  dedupeRealiaSpans,
  ENTITY_ID_PREFIX,
  entitySpanKey,
  getUsedEntityTypes,
  getUsedRealiaIds,
  isDuplicateEntitySpan,
  isDuplicateRealiaSpan,
  isRealiaAnnotationSpan,
  isSameRange,
  omitDerivedSpanFields,
  realiaSpanKey,
  REALIA_ID_PREFIX,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import {
  entityAnnotationSpan,
  realiaAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'

const tag: ApiEntityAnnotationSpan = {
  id: 'Entity-1',
  type: 'PERSONAL_NAME',
  span: ['Word-1'],
}
const realia: ApiRealiaAnnotationSpan = {
  id: 'Realia-1',
  realiaId: 'realia_000846',
  span: ['Word-1'],
}

describe('isRealiaAnnotationSpan', () => {
  it('discriminates a single derived span by its layer', () => {
    expect(isRealiaAnnotationSpan(realiaAnnotationSpan(realia))).toBe(true)
    expect(isRealiaAnnotationSpan(entityAnnotationSpan(tag))).toBe(false)
  })
})

describe('annotationSpanName', () => {
  it('uses the entity type name for a tag', () => {
    expect(annotationSpanName(entityAnnotationSpan(tag))).toBe('Personal Name')
  })

  it('uses the realiaId for a realia', () => {
    expect(annotationSpanName(realiaAnnotationSpan(realia))).toBe(
      'realia_000846',
    )
  })
})

describe('omitDerivedSpanFields', () => {
  it('strips tier, name and layer from each collection', () => {
    expect(
      omitDerivedSpanFields({
        namedEntities: [entityAnnotationSpan(tag)],
        realia: [realiaAnnotationSpan(realia, { tier: 2 })],
      }),
    ).toEqual({ namedEntities: [tag], realia: [realia] })
  })

  it('never puts a realiaId in namedEntities or a type in realia', () => {
    const spans = omitDerivedSpanFields({
      namedEntities: [entityAnnotationSpan(tag)],
      realia: [realiaAnnotationSpan(realia)],
    })

    expect(spans.namedEntities[0]).not.toHaveProperty('realiaId')
    expect(spans.realia[0]).not.toHaveProperty('type')
  })

  it('yields empty collections for no annotations', () => {
    expect(omitDerivedSpanFields({ namedEntities: [], realia: [] })).toEqual({
      namedEntities: [],
      realia: [],
    })
  })
})

describe('isSameRange', () => {
  it('ignores the order of the token ids', () => {
    expect(isSameRange(['Word-2', 'Word-3'], ['Word-3', 'Word-2'])).toBe(true)
  })

  it('distinguishes different ranges', () => {
    expect(isSameRange(['Word-2'], ['Word-2', 'Word-3'])).toBe(false)
  })
})

describe('span keys', () => {
  it('keys a tag by its type and range', () => {
    expect(entitySpanKey(tag)).toBe('PERSONAL_NAME|Word-1')
  })

  it('keys a realia by its realiaId and range', () => {
    expect(realiaSpanKey(realia)).toBe('realia_000846|Word-1')
  })

  it('keys a reordered range identically', () => {
    expect(entitySpanKey({ ...tag, span: ['Word-2', 'Word-1'] })).toBe(
      entitySpanKey({ ...tag, span: ['Word-1', 'Word-2'] }),
    )
  })
})

describe('isDuplicateEntitySpan', () => {
  it('detects the same tag on the same range', () => {
    expect(isDuplicateEntitySpan([tag], { ...tag, id: 'Entity-2' })).toBe(true)
  })

  it('detects a duplicate whose span is in a different order', () => {
    const wide = { ...tag, span: ['Word-2', 'Word-3'] }
    expect(
      isDuplicateEntitySpan([wide], {
        ...wide,
        id: 'Entity-2',
        span: ['Word-3', 'Word-2'],
      }),
    ).toBe(true)
  })

  it('allows the same tag on a different range', () => {
    expect(
      isDuplicateEntitySpan([tag], {
        ...tag,
        id: 'Entity-2',
        span: ['Word-2'],
      }),
    ).toBe(false)
  })

  it('allows a different tag on the same range', () => {
    expect(
      isDuplicateEntitySpan([tag], {
        ...tag,
        id: 'Entity-2',
        type: 'ROYAL_NAME',
      }),
    ).toBe(false)
  })

  it('does not treat a tag as a duplicate of itself', () => {
    expect(isDuplicateEntitySpan([tag], tag)).toBe(false)
  })
})

describe('isDuplicateRealiaSpan', () => {
  it('detects the same realia on the same range', () => {
    expect(isDuplicateRealiaSpan([realia], { ...realia, id: 'Realia-2' })).toBe(
      true,
    )
  })

  it('allows a different realia on the same range', () => {
    expect(
      isDuplicateRealiaSpan([realia], {
        ...realia,
        id: 'Realia-2',
        realiaId: 'realia_000999',
      }),
    ).toBe(false)
  })
})

describe('dedupe', () => {
  it('keeps the first of each duplicate tag', () => {
    expect(dedupeEntitySpans([tag, { ...tag, id: 'Entity-2' }])).toEqual([tag])
  })

  it('keeps the first of each duplicate realia', () => {
    expect(dedupeRealiaSpans([realia, { ...realia, id: 'Realia-2' }])).toEqual([
      realia,
    ])
  })

  it('keeps distinct tags', () => {
    const other = { ...tag, id: 'Entity-2', type: 'ROYAL_NAME' as const }
    expect(dedupeEntitySpans([tag, other])).toEqual([tag, other])
  })
})

describe('getUsedEntityTypes', () => {
  it('lists the tags on the range', () => {
    expect(getUsedEntityTypes([tag], ['Word-1'])).toEqual(['PERSONAL_NAME'])
  })

  it('matches the range regardless of order', () => {
    const wide = { ...tag, span: ['Word-1', 'Word-2'] }
    expect(getUsedEntityTypes([wide], ['Word-2', 'Word-1'])).toEqual([
      'PERSONAL_NAME',
    ])
  })

  it('ignores other ranges', () => {
    expect(getUsedEntityTypes([tag], ['Word-2'])).toEqual([])
  })

  it('excludes the annotation being edited', () => {
    expect(getUsedEntityTypes([tag], ['Word-1'], 'Entity-1')).toEqual([])
  })
})

describe('getUsedRealiaIds', () => {
  it('lists the realia on the range', () => {
    expect(getUsedRealiaIds([realia], ['Word-1'])).toEqual(['realia_000846'])
  })

  it('excludes the annotation being edited', () => {
    expect(getUsedRealiaIds([realia], ['Word-1'], 'Realia-1')).toEqual([])
  })
})

describe('createAnnotationSpanId', () => {
  it('starts at one when no ids exist', () => {
    expect(createAnnotationSpanId([], ENTITY_ID_PREFIX)).toBe('Entity-1')
  })

  it('increments the highest id of the matching prefix', () => {
    expect(
      createAnnotationSpanId(['Entity-1', 'Entity-4'], ENTITY_ID_PREFIX),
    ).toBe('Entity-5')
  })

  it('numbers the kinds independently, keeping ids unique across both', () => {
    const ids = ['Entity-9', 'Realia-2']
    expect(createAnnotationSpanId(ids, REALIA_ID_PREFIX)).toBe('Realia-3')
    expect(createAnnotationSpanId(ids, ENTITY_ID_PREFIX)).toBe('Entity-10')
  })
})
