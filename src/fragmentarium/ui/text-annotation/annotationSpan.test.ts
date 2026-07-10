import {
  annotationSpanClassName,
  annotationSpanName,
  ApiEntityAnnotationSpan,
  ApiRealiaAnnotationSpan,
  createAnnotationSpanId,
  ENTITY_ID_PREFIX,
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
