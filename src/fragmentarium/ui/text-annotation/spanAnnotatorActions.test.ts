import {
  buildRealiaAnnotations,
  buildTagAnnotations,
  getExistingIds,
  hasTagForSpan,
  isEmpty,
  noNewAnnotations,
} from 'fragmentarium/ui/text-annotation/spanAnnotatorActions'
import { DerivedAnnotationSpans } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { toRealiaOption } from 'fragmentarium/ui/text-annotation/RealiaSelect'
import {
  entityAnnotationSpan,
  realiaAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'
import { realiaEntryFactory } from 'test-support/realia-fixtures'

const span = ['Word-1', 'Word-2']

const emptySpans: DerivedAnnotationSpans = { namedEntities: [], realia: [] }

const withTag: DerivedAnnotationSpans = {
  namedEntities: [
    entityAnnotationSpan({ id: 'Entity-1', type: 'ROYAL_NAME', span }),
  ],
  realia: [],
}

const withRealia: DerivedAnnotationSpans = {
  namedEntities: [],
  realia: [
    realiaAnnotationSpan({
      id: 'Realia-1',
      realiaId: 'realia_000846',
      span,
    }),
  ],
}

const mappedOption = toRealiaOption(
  realiaEntryFactory.build({
    id: 'Apkallu',
    realiaId: 'realia_000846',
    type: ['Divine names'],
  }),
)
const unmappedOption = toRealiaOption(
  realiaEntryFactory.build({
    id: 'Ziggurat',
    realiaId: 'realia_000999',
    type: ['Literature'],
  }),
)

describe('isEmpty', () => {
  it('is true when nothing was built', () => {
    expect(isEmpty(noNewAnnotations)).toBe(true)
  })

  it('is false when a realia was built', () => {
    expect(
      isEmpty(buildRealiaAnnotations(emptySpans, span, mappedOption)),
    ).toBe(false)
  })
})

describe('getExistingIds', () => {
  it('collects the ids of both kinds so they stay unique across layers', () => {
    expect(
      getExistingIds({
        namedEntities: withTag.namedEntities,
        realia: withRealia.realia,
      }),
    ).toEqual(['Entity-1', 'Realia-1'])
  })
})

describe('hasTagForSpan', () => {
  it('finds a tag covering the same range', () => {
    expect(hasTagForSpan(withTag, span)).toBe(true)
  })

  it('ignores a tag covering a different range', () => {
    expect(hasTagForSpan(withTag, ['Word-9'])).toBe(false)
  })

  it('never counts a realia as a tag', () => {
    expect(hasTagForSpan(withRealia, span)).toBe(false)
  })
})

describe('buildTagAnnotations', () => {
  it('creates a tag and no realia', () => {
    expect(
      buildTagAnnotations(emptySpans, span, { value: 'PERSONAL_NAME' }),
    ).toEqual({
      tag: { id: 'Entity-1', type: 'PERSONAL_NAME', span },
      realia: null,
    })
  })

  it('creates nothing when the tag selection is cleared', () => {
    expect(buildTagAnnotations(emptySpans, span, null)).toEqual(
      noNewAnnotations,
    )
  })
})

describe('buildRealiaAnnotations', () => {
  it('creates nothing when the selection is cleared', () => {
    expect(buildRealiaAnnotations(emptySpans, span, null)).toEqual(
      noNewAnnotations,
    )
  })

  it('creates the realia and the mapped tag, each in its own field', () => {
    expect(buildRealiaAnnotations(emptySpans, span, mappedOption)).toEqual({
      realia: { id: 'Realia-1', realiaId: 'realia_000846', span },
      tag: { id: 'Entity-1', type: 'DIVINE_NAME', span },
    })
  })

  it('omits the tag when the range already has one', () => {
    expect(buildRealiaAnnotations(withTag, span, mappedOption)).toEqual({
      realia: { id: 'Realia-1', realiaId: 'realia_000846', span },
      tag: null,
    })
  })

  it('omits the tag when the classification is not mapped', () => {
    expect(buildRealiaAnnotations(emptySpans, span, unmappedOption)).toEqual({
      realia: { id: 'Realia-1', realiaId: 'realia_000999', span },
      tag: null,
    })
  })

  it('omits the tag when the option carries no entry', () => {
    expect(
      buildRealiaAnnotations(emptySpans, span, {
        label: 'Apkallu',
        value: 'realia_000846',
      }),
    ).toEqual({
      realia: { id: 'Realia-1', realiaId: 'realia_000846', span },
      tag: null,
    })
  })

  it('numbers the new ids against both kinds', () => {
    expect(
      buildRealiaAnnotations(
        { namedEntities: withTag.namedEntities, realia: withRealia.realia },
        ['Word-3'],
        mappedOption,
      ),
    ).toEqual({
      realia: {
        id: 'Realia-2',
        realiaId: 'realia_000846',
        span: ['Word-3'],
      },
      tag: { id: 'Entity-2', type: 'DIVINE_NAME', span: ['Word-3'] },
    })
  })
})
