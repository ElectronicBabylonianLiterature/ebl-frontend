import {
  buildRealiaAnnotations,
  buildTagAnnotations,
  hasTagForSpan,
} from 'fragmentarium/ui/text-annotation/spanAnnotatorActions'
import { AnnotationSpan } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { toRealiaOption } from 'fragmentarium/ui/text-annotation/RealiaSelect'
import { realiaEntryFactory } from 'test-support/realia-fixtures'

const span = ['Word-1', 'Word-2']

const existingTag: AnnotationSpan = {
  id: 'Entity-1',
  type: 'ROYAL_NAME',
  span,
  tier: 1,
  name: 'Royal Name',
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

describe('hasTagForSpan', () => {
  it('finds a tag covering the same span', () => {
    expect(hasTagForSpan([existingTag], span)).toBe(true)
  })

  it('ignores a tag covering a different span', () => {
    expect(hasTagForSpan([existingTag], ['Word-9'])).toBe(false)
  })

  it('ignores the realia layer', () => {
    const realiaSpan: AnnotationSpan = {
      id: 'Realia-1',
      realiaId: 'realia_000846',
      span,
      tier: 1,
      name: 'realia_000846',
    }
    expect(hasTagForSpan([realiaSpan], span)).toBe(false)
  })
})

describe('buildTagAnnotations', () => {
  it('creates a tag annotation', () => {
    expect(buildTagAnnotations([], span, { value: 'PERSONAL_NAME' })).toEqual([
      { id: 'Entity-1', type: 'PERSONAL_NAME', span },
    ])
  })

  it('creates nothing when the tag selection is cleared', () => {
    expect(buildTagAnnotations([], span, null)).toEqual([])
  })
})

describe('buildRealiaAnnotations', () => {
  it('creates nothing when the selection is cleared', () => {
    expect(buildRealiaAnnotations([], span, null)).toEqual([])
  })

  it('creates the realia annotation and the mapped tag', () => {
    expect(buildRealiaAnnotations([], span, mappedOption)).toEqual([
      { id: 'Realia-1', realiaId: 'realia_000846', span },
      { id: 'Entity-1', type: 'DIVINE_NAME', span },
    ])
  })

  it('omits the tag when the span already has one', () => {
    expect(buildRealiaAnnotations([existingTag], span, mappedOption)).toEqual([
      { id: 'Realia-1', realiaId: 'realia_000846', span },
    ])
  })

  it('omits the tag when the classification is not mapped', () => {
    expect(buildRealiaAnnotations([], span, unmappedOption)).toEqual([
      { id: 'Realia-1', realiaId: 'realia_000999', span },
    ])
  })

  it('omits the tag when the option carries no entry', () => {
    expect(
      buildRealiaAnnotations([], span, {
        label: 'Apkallu',
        value: 'realia_000846',
      }),
    ).toEqual([{ id: 'Realia-1', realiaId: 'realia_000846', span }])
  })
})
