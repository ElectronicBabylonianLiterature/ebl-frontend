import {
  annotationSpanName,
  createAnnotationSpanId,
  dedupeAnnotations,
  ENTITY_ID_PREFIX,
  getUsedEntityTypes,
  getUsedRealiaIds,
  isDuplicateAnnotation,
  isEntityAnnotationSpan,
  isRealiaAnnotationSpan,
  isSameRange,
  omitDerivedSpanFields,
  REALIA_ID_PREFIX,
  tagEntitySpan,
  tagRealiaSpan,
  toTaggedSpans,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import {
  entityAnnotationSpan,
  realiaAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'

const tag = tagEntitySpan({
  id: 'Entity-1',
  type: 'PERSONAL_NAME',
  span: ['Word-1'],
})
const realia = tagRealiaSpan({
  id: 'Realia-1',
  realiaId: 'realia_000846',
  span: ['Word-1'],
})

describe('layer guards', () => {
  it('recognises realia spans', () => {
    expect(isRealiaAnnotationSpan(realia)).toBe(true)
    expect(isRealiaAnnotationSpan(tag)).toBe(false)
  })

  it('recognises tag spans', () => {
    expect(isEntityAnnotationSpan(tag)).toBe(true)
    expect(isEntityAnnotationSpan(realia)).toBe(false)
  })
})

describe('toTaggedSpans', () => {
  it('tags each list with its layer', () => {
    expect(
      toTaggedSpans({
        namedEntities: [{ id: 'Entity-1', type: 'PERSONAL_NAME', span: ['a'] }],
        realia: [{ id: 'Realia-1', realiaId: 'realia_1', span: ['a'] }],
      }),
    ).toEqual([
      {
        id: 'Entity-1',
        type: 'PERSONAL_NAME',
        span: ['a'],
        layer: 'namedEntities',
      },
      { id: 'Realia-1', realiaId: 'realia_1', span: ['a'], layer: 'realia' },
    ])
  })
})

describe('omitDerivedSpanFields', () => {
  it('partitions into the two lists and strips tier, name and layer', () => {
    expect(
      omitDerivedSpanFields([
        realiaAnnotationSpan(
          { id: 'Realia-1', realiaId: 'realia_000846', span: ['Word-1'] },
          { tier: 2 },
        ),
        entityAnnotationSpan({
          id: 'Entity-1',
          type: 'PERSONAL_NAME',
          span: ['Word-1'],
        }),
      ]),
    ).toEqual({
      namedEntities: [
        { id: 'Entity-1', type: 'PERSONAL_NAME', span: ['Word-1'] },
      ],
      realia: [{ id: 'Realia-1', realiaId: 'realia_000846', span: ['Word-1'] }],
    })
  })

  it('never puts a realiaId in namedEntities or a type in realia', () => {
    const spans = omitDerivedSpanFields([
      entityAnnotationSpan({
        id: 'Entity-1',
        type: 'PERSONAL_NAME',
        span: ['Word-1'],
      }),
      realiaAnnotationSpan({
        id: 'Realia-1',
        realiaId: 'realia_000846',
        span: ['Word-1'],
      }),
    ])

    expect(spans.namedEntities[0]).not.toHaveProperty('realiaId')
    expect(spans.realia[0]).not.toHaveProperty('type')
  })

  it('yields empty lists for no annotations', () => {
    expect(omitDerivedSpanFields([])).toEqual({
      namedEntities: [],
      realia: [],
    })
  })
})

describe('annotationSpanName', () => {
  it('uses the entity type name for tags', () => {
    expect(annotationSpanName(tag)).toBe('Personal Name')
  })

  it('uses the realiaId for realia', () => {
    expect(annotationSpanName(realia)).toBe('realia_000846')
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

describe('isDuplicateAnnotation', () => {
  it('detects the same tag on the same range', () => {
    expect(isDuplicateAnnotation([tag], { ...tag, id: 'Entity-2' })).toBe(true)
  })

  it('detects the same realia on the same range', () => {
    expect(isDuplicateAnnotation([realia], { ...realia, id: 'Realia-2' })).toBe(
      true,
    )
  })

  it('detects a duplicate whose span is in a different order', () => {
    const wide = tagEntitySpan({
      id: 'Entity-1',
      type: 'PERSONAL_NAME',
      span: ['Word-2', 'Word-3'],
    })
    expect(
      isDuplicateAnnotation([wide], {
        ...wide,
        id: 'Entity-2',
        span: ['Word-3', 'Word-2'],
      }),
    ).toBe(true)
  })

  it('allows the same tag on a different range', () => {
    expect(
      isDuplicateAnnotation([tag], {
        ...tag,
        id: 'Entity-2',
        span: ['Word-2'],
      }),
    ).toBe(false)
  })

  it('allows a different tag on the same range', () => {
    expect(
      isDuplicateAnnotation([tag], {
        ...tag,
        id: 'Entity-2',
        type: 'ROYAL_NAME',
      }),
    ).toBe(false)
  })

  it('allows a tag and a realia on the same range', () => {
    expect(isDuplicateAnnotation([tag], realia)).toBe(false)
  })

  it('does not treat an annotation as a duplicate of itself', () => {
    expect(isDuplicateAnnotation([tag], tag)).toBe(false)
  })
})

describe('dedupeAnnotations', () => {
  it('keeps the first occurrence of each duplicate', () => {
    expect(
      dedupeAnnotations([
        tag,
        { ...tag, id: 'Entity-2' },
        realia,
        { ...realia, id: 'Realia-2' },
      ]),
    ).toEqual([tag, realia])
  })

  it('deduplicates across a reordered span', () => {
    const wide = tagEntitySpan({
      id: 'Entity-1',
      type: 'PERSONAL_NAME',
      span: ['Word-2', 'Word-3'],
    })
    expect(
      dedupeAnnotations([
        wide,
        { ...wide, id: 'Entity-2', span: ['Word-3', 'Word-2'] },
      ]),
    ).toEqual([wide])
  })

  it('keeps distinct annotations', () => {
    const other = { ...tag, id: 'Entity-2', type: 'ROYAL_NAME' as const }
    expect(dedupeAnnotations([tag, other])).toEqual([tag, other])
  })
})

describe('getUsedEntityTypes', () => {
  it('lists only the tags on the range', () => {
    expect(getUsedEntityTypes([tag, realia], ['Word-1'])).toEqual([
      'PERSONAL_NAME',
    ])
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
  it('lists only the realia on the range', () => {
    expect(getUsedRealiaIds([tag, realia], ['Word-1'])).toEqual([
      'realia_000846',
    ])
  })

  it('excludes the annotation being edited', () => {
    expect(getUsedRealiaIds([realia], ['Word-1'], 'Realia-1')).toEqual([])
  })
})

describe('createAnnotationSpanId', () => {
  it('starts at one when no spans exist', () => {
    expect(createAnnotationSpanId([], ENTITY_ID_PREFIX)).toBe('Entity-1')
  })

  it('increments the highest id of the matching prefix', () => {
    expect(
      createAnnotationSpanId(
        [tag, { ...tag, id: 'Entity-4' }],
        ENTITY_ID_PREFIX,
      ),
    ).toBe('Entity-5')
  })

  it('numbers the layers independently, keeping ids unique across both', () => {
    const spans = [
      { ...tag, id: 'Entity-9' },
      { ...realia, id: 'Realia-2' },
    ]
    expect(createAnnotationSpanId(spans, REALIA_ID_PREFIX)).toBe('Realia-3')
    expect(createAnnotationSpanId(spans, ENTITY_ID_PREFIX)).toBe('Entity-10')
  })
})
