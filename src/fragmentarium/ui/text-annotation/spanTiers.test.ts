import { AnnotationSpans } from 'fragmentarium/ui/text-annotation/annotationSpan'
import {
  MAX_TIER_DEPTH,
  setTiers,
} from 'fragmentarium/ui/text-annotation/spanTiers'
import _ from 'lodash'

const words = ['Word-1', 'Word-2', 'Word-3']

const spans: AnnotationSpans = {
  namedEntities: [
    { id: 'Entity-1', type: 'PERSONAL_NAME', span: ['Word-2'] },
    { id: 'Entity-2', type: 'BUILDING_NAME', span: ['Word-2', 'Word-3'] },
  ],
  realia: [{ id: 'Realia-1', realiaId: 'realia_000846', span: ['Word-3'] }],
}

describe('setTiers', () => {
  it('gives the longer span the lower tier', () => {
    const { namedEntities } = setTiers(words, spans)

    expect(namedEntities).toEqual([
      {
        ...spans.namedEntities[0],
        layer: 'namedEntities',
        tier: 2,
        name: 'Personal Name',
      },
      {
        ...spans.namedEntities[1],
        layer: 'namedEntities',
        tier: 1,
        name: 'Building Name',
      },
    ])
  })

  it('stacks the realia below the deepest named entity', () => {
    expect(setTiers(words, spans).realia).toEqual([
      {
        ...spans.realia[0],
        layer: 'realia',
        tier: 3,
        name: 'realia_000846',
      },
    ])
  })

  it('starts the realia at the first tier when there are no named entities', () => {
    const { realia } = setTiers(words, { ...spans, namedEntities: [] })

    expect(realia[0].tier).toEqual(1)
  })

  it('keeps the tier of a span that stays open across a repeated word', () => {
    const { namedEntities } = setTiers(['Word-2', 'Word-2', 'Word-3'], spans)

    expect(namedEntities.map(({ id, tier }) => [id, tier])).toEqual([
      ['Entity-1', 2],
      ['Entity-2', 1],
    ])
  })
})

describe('setTiers clamps to the deepest tier the stylesheet generates', () => {
  const word = 'Word-1'
  const deepSpans: AnnotationSpans = {
    namedEntities: _.range(MAX_TIER_DEPTH + 3).map((index) => ({
      id: `Entity-${index}`,
      type: 'PERSONAL_NAME',
      span: [word],
    })),
    realia: _.range(3).map((index) => ({
      id: `Realia-${index}`,
      realiaId: `realia_00000${index}`,
      span: [word],
    })),
  }

  it('never gives a tag a tier without a rule', () => {
    const tiers = setTiers([word], deepSpans).namedEntities.map(
      ({ tier }) => tier,
    )

    expect(_.max(tiers)).toEqual(MAX_TIER_DEPTH)
  })

  it('never gives a realia stacked above the tags a tier without a rule', () => {
    const tiers = setTiers([word], deepSpans).realia.map(({ tier }) => tier)

    expect(_.max(tiers)).toEqual(MAX_TIER_DEPTH)
  })
})
