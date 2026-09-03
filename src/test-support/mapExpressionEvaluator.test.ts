import { evaluateExpression, evaluatePaint } from './mapExpressionEvaluator'

const CLUSTER_COUNT_PROPERTY = 'point_count'

function clusterProperties(count: number): Record<string, number> {
  return { [CLUSTER_COUNT_PROPERTY]: count }
}

describe('literals and lookups', () => {
  it('returns non-expression values unchanged', () => {
    expect(evaluateExpression(7)).toBe(7)
    expect(evaluateExpression('#fff')).toBe('#fff')
    expect(evaluateExpression([1, 2])).toEqual([1, 2])
  })

  it('unwraps literal arrays', () => {
    expect(evaluateExpression(['literal', [2, 1.5]])).toEqual([2, 1.5])
  })

  it('reads feature state and properties', () => {
    const context = {
      featureState: { count: 4 },
      properties: { name: 'Area A' },
    }

    expect(evaluateExpression(['feature-state', 'count'], context)).toBe(4)
    expect(evaluateExpression(['get', 'name'], context)).toBe('Area A')
    expect(
      evaluateExpression(['feature-state', 'missing'], context),
    ).toBeUndefined()
  })

  it('reports property presence', () => {
    expect(
      evaluateExpression(['has', 'point_count'], {
        properties: clusterProperties(3),
      }),
    ).toBe(true)
    expect(evaluateExpression(['has', 'point_count'], {})).toBe(false)
  })
})

describe('coalesce and boolean coercion', () => {
  it('takes the first defined value', () => {
    expect(
      evaluateExpression(['coalesce', ['feature-state', 'missing'], 0], {}),
    ).toBe(0)
  })

  it('returns null when nothing is defined', () => {
    expect(
      evaluateExpression(['coalesce', ['feature-state', 'missing']], {}),
    ).toBeNull()
  })

  it('falls back when feature state is not boolean', () => {
    expect(
      evaluateExpression(['boolean', ['feature-state', 'selected'], false], {}),
    ).toBe(false)
    expect(
      evaluateExpression(['boolean', ['feature-state', 'selected'], false], {
        featureState: { selected: true },
      }),
    ).toBe(true)
  })
})

describe('operators', () => {
  it.each([
    [['==', 1, 1], true],
    [['==', 1, 2], false],
    [['>', 3, 1], true],
    [['>', 1, 3], false],
    [['<', 1, 3], true],
    [['!', false], true],
    [['+', 1, 2, 3], 6],
    [['*', 2, 3], 6],
  ])('evaluates %j', (expression, expected) => {
    expect(evaluateExpression(expression)).toBe(expected)
  })

  it('treats non-numeric comparisons as false', () => {
    expect(evaluateExpression(['>', 'a', 1])).toBe(false)
  })
})

describe('case', () => {
  it('returns the first matching branch', () => {
    expect(evaluateExpression(['case', false, 'a', true, 'b', 'c'])).toBe('b')
  })

  it('falls through to the default', () => {
    expect(evaluateExpression(['case', false, 'a', 'fallback'])).toBe(
      'fallback',
    )
  })
})

describe('step', () => {
  const expression = ['step', ['get', 'n'], 'low', 10, 'mid', 20, 'high']
  const stepFor = (n: number): unknown =>
    evaluateExpression(expression, { properties: { n } })

  it.each([
    [0, 'low'],
    [9, 'low'],
    [10, 'mid'],
    [19, 'mid'],
    [20, 'high'],
    [999, 'high'],
  ])('maps %s to %s', (input, expected) => {
    expect(stepFor(input)).toBe(expected)
  })
})

describe('interpolate', () => {
  const expression = ['interpolate', ['linear'], ['get', 'n'], 0, 0, 10, 100]
  const interpolateFor = (n: number): unknown =>
    evaluateExpression(expression, { properties: { n } })

  it.each([
    [-5, 0],
    [0, 0],
    [5, 50],
    [10, 100],
    [50, 100],
  ])('maps %s to %s', (input, expected) => {
    expect(interpolateFor(input)).toBe(expected)
  })
})

describe('evaluatePaint', () => {
  it('evaluates a named paint property', () => {
    expect(
      evaluatePaint(
        { 'fill-opacity': ['case', true, 0.5, 0.1] },
        'fill-opacity',
      ),
    ).toBe(0.5)
  })

  it('returns undefined for a missing paint object or property', () => {
    expect(evaluatePaint(undefined, 'fill-color')).toBeUndefined()
    expect(evaluatePaint({}, 'fill-color')).toBeUndefined()
  })
})

describe('unsupported operators', () => {
  it('fails loudly rather than silently returning a wrong value', () => {
    expect(() => evaluateExpression(['zoom-scale', 1])).toThrow(
      'Unsupported map expression operator: zoom-scale',
    )
  })
})
