import {
  compileBundle,
  CompiledRule,
  ElementQuery,
  resolveWinner,
} from 'fragmentarium/ui/text-annotation/cssCascade.testSupport'

const NAMED_ENTITIES_SASS =
  'src/fragmentarium/ui/text-annotation/NamedEntities.sass'
const TEXT_ANNOTATION_SASS =
  'src/fragmentarium/ui/text-annotation/TextAnnotation.sass'

const entityColors: ReadonlyArray<[string, string, string]> = [
  ['BUILDING_NAME', '#d2b48c', '"BN"'],
  ['CELESTIAL_NAME', '#87ceeb', '"CN"'],
  ['DIVINE_NAME', '#f0e68c', '"DN"'],
  ['ETHNOS_NAME', '#deb887', '"EN"'],
  ['PERSONAL_NAME', '#f4a460', '"PN"'],
  ['ROYAL_NAME', '#da70d6', '"RN"'],
  ['FIELD_NAME', '#adff2f', '"FN"'],
  ['GEOGRAPHICAL_NAME', '#cd853f', '"GN"'],
  ['WATERCOURSE_NAME', '#87ceeb', '"WN"'],
  ['MONTH_NAME', '#f5deb3', '"MN"'],
  ['YEAR_NAME', '#c0c0c0', '"YN"'],
  ['OBJECT_NAME', '#a9a9a9', '"ON"'],
  ['REALIA', '#66cdaa', '"RLA"'],
]

let rules: readonly CompiledRule[]

beforeAll(() => {
  rules = compileBundle([NAMED_ENTITIES_SASS, TEXT_ANNOTATION_SASS])
})

function tagBadge(entityClass: string): ElementQuery {
  return {
    classes: ['span-indicator', 'tier-depth--1', entityClass, 'initial'],
    pseudoElement: 'before',
  }
}

function realiaBadge(entityClass: string): ElementQuery {
  return {
    classes: [
      'span-indicator',
      'tier-depth--1',
      entityClass,
      'span-indicator--realia',
      'initial',
    ],
    attributes: ['data-label'],
    pseudoElement: 'before',
  }
}

describe('named entity badge colours beat the DEFAULT fallback', () => {
  it.each(entityColors)('colours the %s badge %s', (entityType, colour) => {
    const element = tagBadge(`named-entity__${entityType}`)
    expect(resolveWinner(rules, element, 'background-color')).toEqual(colour)
  })

  it.each(entityColors)('labels the %s badge', (entityType, _colour, label) => {
    const element = tagBadge(`named-entity__${entityType}`)
    expect(resolveWinner(rules, element, 'content')).toEqual(label)
  })

  it('colours the span indicator element itself, not red', () => {
    const element: ElementQuery = {
      classes: ['span-indicator', 'named-entity__PERSONAL_NAME', 'initial'],
    }
    expect(resolveWinner(rules, element, 'background-color')).toEqual('#f4a460')
  })
})

describe('realia badges keep their lemma label and their colour', () => {
  it('colours an unmapped realia badge with the realia colour', () => {
    const element = realiaBadge('named-entity__REALIA')
    expect(resolveWinner(rules, element, 'background-color')).toEqual('#66cdaa')
  })

  it('colours a mapped realia badge like its tag', () => {
    const element = realiaBadge('named-entity__DIVINE_NAME')
    expect(resolveWinner(rules, element, 'background-color')).toEqual('#f0e68c')
  })

  it('labels a realia badge with its data-label, not the tag abbreviation', () => {
    expect(
      resolveWinner(rules, realiaBadge('named-entity__REALIA'), 'content'),
    ).toEqual('attr(data-label)')
    expect(
      resolveWinner(rules, realiaBadge('named-entity__DIVINE_NAME'), 'content'),
    ).toEqual('attr(data-label)')
  })
})

describe('the DEFAULT fallback still applies to a typeless indicator', () => {
  const element: ElementQuery = {
    classes: ['span-indicator', 'initial'],
    pseudoElement: 'before',
  }

  it('shows the DEFAULT label', () => {
    expect(resolveWinner(rules, element, 'content')).toEqual('"DEFAULT"')
  })

  it('shows the red fallback colour', () => {
    expect(resolveWinner(rules, element, 'background-color')).toEqual('red')
  })

  it('ignores complex selectors it cannot model', () => {
    expect(resolveWinner(rules, element, 'padding-bottom')).toBeUndefined()
  })
})

describe('a hovered realia badge expands its label', () => {
  const hoveredRealiaBadge: ElementQuery = {
    classes: [
      'span-indicator',
      'named-entity__REALIA',
      'span-indicator--realia',
      'initial',
    ],
    attributes: ['data-label'],
    states: ['hover'],
    pseudoElement: 'before',
  }

  it('widens the label on hover', () => {
    expect(resolveWinner(rules, hoveredRealiaBadge, 'max-width')).toEqual(
      '16em',
    )
  })

  it('does not widen the label without the hover state', () => {
    const restingRealiaBadge: ElementQuery = {
      ...hoveredRealiaBadge,
      states: [],
    }
    expect(resolveWinner(rules, restingRealiaBadge, 'max-width')).toEqual(
      'calc(100% - 0.25rem)',
    )
  })
})

describe('display indicators are not interactive except realia', () => {
  it('gives a static tag indicator the default cursor', () => {
    const element: ElementQuery = {
      classes: [
        'span-indicator',
        'named-entity__PERSONAL_NAME',
        'span-indicator--static',
        'initial',
      ],
    }
    expect(resolveWinner(rules, element, 'cursor')).toEqual('default')
  })

  it('keeps the pointer cursor on a static realia indicator', () => {
    const element: ElementQuery = {
      classes: [
        'span-indicator',
        'named-entity__REALIA',
        'span-indicator--realia',
        'span-indicator--static',
        'initial',
      ],
    }
    expect(resolveWinner(rules, element, 'cursor')).toEqual('pointer')
  })
})
