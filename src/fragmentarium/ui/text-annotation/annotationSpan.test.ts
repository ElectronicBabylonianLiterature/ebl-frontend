import {
  annotationSpanClassName,
  annotationSpanName,
  ApiEntityAnnotationSpan,
  ApiRealiaAnnotationSpan,
  createAnnotationSpanId,
  dedupeAnnotations,
  ENTITY_ID_PREFIX,
  getUsedEntityTypes,
  getUsedRealiaIds,
  isDuplicateAnnotation,
  isEntityAnnotationSpan,
  isRealiaAnnotationSpan,
  omitDerivedSpanFields,
  REALIA_ID_PREFIX,
} from 'fragmentarium/ui/text-annotation/annotationSpan'

const entitySpan: ApiEntityAnnotationSpan = {
  id: 'Entity-1',
  type: 'PERSONAL_NAME',
  span: ['Word-1'],
}

const realiaSpan: ApiRealiaAnnotationSpan = {
  id: 'Realia-1',
  realiaId: 'realia_000846',
  span: ['Word-1'],
}

describe('annotation span guards', () => {
  it('recognises realia spans', () => {
    expect(isRealiaAnnotationSpan(realiaSpan)).toBe(true)
    expect(isRealiaAnnotationSpan(entitySpan)).toBe(false)
  })

  it('recognises entity spans', () => {
    expect(isEntityAnnotationSpan(entitySpan)).toBe(true)
    expect(isEntityAnnotationSpan(realiaSpan)).toBe(false)
  })
})

describe('annotationSpanName', () => {
  it('uses the entity type name for entity spans', () => {
    expect(annotationSpanName(entitySpan)).toBe('Personal Name')
  })

  it('uses the realiaId for realia spans', () => {
    expect(annotationSpanName(realiaSpan)).toBe('realia_000846')
  })
})

describe('annotationSpanClassName', () => {
  it('derives the class from the entity type', () => {
    expect(annotationSpanClassName(entitySpan)).toBe(
      'named-entity__PERSONAL_NAME',
    )
  })

  it('uses a single class for realia spans', () => {
    expect(annotationSpanClassName(realiaSpan)).toBe('named-entity__REALIA')
  })
})

describe('omitDerivedSpanFields', () => {
  it('strips tier and name from both layers', () => {
    expect(
      omitDerivedSpanFields([
        { ...entitySpan, tier: 2, name: 'Personal Name' },
        { ...realiaSpan, tier: 1, name: 'realia_000846' },
      ]),
    ).toEqual([entitySpan, realiaSpan])
  })
})

describe('createAnnotationSpanId', () => {
  it('starts at one when no spans exist', () => {
    expect(createAnnotationSpanId([], ENTITY_ID_PREFIX)).toBe('Entity-1')
  })

  it('increments the highest id of the matching prefix', () => {
    expect(
      createAnnotationSpanId(
        [entitySpan, { ...entitySpan, id: 'Entity-4' }],
        ENTITY_ID_PREFIX,
      ),
    ).toBe('Entity-5')
  })

  it('numbers the layers independently', () => {
    const spans = [
      { ...entitySpan, id: 'Entity-9' },
      { ...realiaSpan, id: 'Realia-2' },
    ]
    expect(createAnnotationSpanId(spans, REALIA_ID_PREFIX)).toBe('Realia-3')
    expect(createAnnotationSpanId(spans, ENTITY_ID_PREFIX)).toBe('Entity-10')
  })
})

describe('isDuplicateAnnotation', () => {
  it('detects the same tag on the same span', () => {
    expect(
      isDuplicateAnnotation([entitySpan], { ...entitySpan, id: 'Entity-2' }),
    ).toBe(true)
  })

  it('detects the same realia on the same span', () => {
    expect(
      isDuplicateAnnotation([realiaSpan], { ...realiaSpan, id: 'Realia-2' }),
    ).toBe(true)
  })

  it('allows the same tag on a different span', () => {
    expect(
      isDuplicateAnnotation([entitySpan], {
        ...entitySpan,
        id: 'Entity-2',
        span: ['Word-2'],
      }),
    ).toBe(false)
  })

  it('allows a different tag on the same span', () => {
    expect(
      isDuplicateAnnotation([entitySpan], {
        ...entitySpan,
        id: 'Entity-2',
        type: 'ROYAL_NAME',
      }),
    ).toBe(false)
  })

  it('allows a different realia on the same span', () => {
    expect(
      isDuplicateAnnotation([realiaSpan], {
        ...realiaSpan,
        id: 'Realia-2',
        realiaId: 'realia_000999',
      }),
    ).toBe(false)
  })

  it('does not treat a tag and a realia on the same span as duplicates', () => {
    expect(isDuplicateAnnotation([entitySpan], realiaSpan)).toBe(false)
  })

  it('does not treat an annotation as a duplicate of itself', () => {
    expect(isDuplicateAnnotation([entitySpan], entitySpan)).toBe(false)
  })
})

describe('dedupeAnnotations', () => {
  it('keeps the first of each duplicate', () => {
    expect(
      dedupeAnnotations([
        entitySpan,
        { ...entitySpan, id: 'Entity-2' },
        realiaSpan,
        { ...realiaSpan, id: 'Realia-2' },
      ]),
    ).toEqual([entitySpan, realiaSpan])
  })

  it('keeps distinct annotations', () => {
    const other = { ...entitySpan, id: 'Entity-2', type: 'ROYAL_NAME' as const }
    expect(dedupeAnnotations([entitySpan, other])).toEqual([entitySpan, other])
  })
})

describe('getUsedEntityTypes', () => {
  it('lists the tags on the span', () => {
    expect(getUsedEntityTypes([entitySpan, realiaSpan], ['Word-1'])).toEqual([
      'PERSONAL_NAME',
    ])
  })

  it('ignores other spans', () => {
    expect(getUsedEntityTypes([entitySpan], ['Word-2'])).toEqual([])
  })

  it('excludes the annotation being edited', () => {
    expect(getUsedEntityTypes([entitySpan], ['Word-1'], 'Entity-1')).toEqual([])
  })
})

describe('getUsedRealiaIds', () => {
  it('lists the realia on the span', () => {
    expect(getUsedRealiaIds([entitySpan, realiaSpan], ['Word-1'])).toEqual([
      'realia_000846',
    ])
  })

  it('excludes the annotation being edited', () => {
    expect(getUsedRealiaIds([realiaSpan], ['Word-1'], 'Realia-1')).toEqual([])
  })
})
