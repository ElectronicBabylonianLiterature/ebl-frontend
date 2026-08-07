import { evaluateExpression } from 'test-support/mapExpressionEvaluator'
import {
  COLOR_MAPPED_FRAGMENTS,
  COLOR_MAPPED_ZERO,
  COLOR_SELECTED,
  COLOR_UNMAPPED,
  DASH_MAPPED,
  DASH_UNMAPPED,
  OUTLINE_SELECTED,
  OUTLINE_UNMAPPED,
  SEQUENTIAL_COLORS,
  type ChoroplethScale,
  excavationFillColor,
  excavationFillOpacity,
  excavationOutlineColor,
  excavationOutlineDash,
  excavationOutlineOpacity,
  excavationOutlineWidth,
} from './mapPaintExpressions'

const scale: ChoroplethScale = {
  valueKey: 'accessibleFragmentCount',
  breaks: [2, 5, 10, 20],
  colors: [...SEQUENTIAL_COLORS],
}

const UNMAPPED = { findspotCount: 0, accessibleFragmentCount: 0 }
const MAPPED_ZERO = { findspotCount: 3, accessibleFragmentCount: 0 }

function colorFor(
  activeScale: ChoroplethScale | null,
  featureState: Record<string, unknown>,
): unknown {
  return evaluateExpression(excavationFillColor(activeScale), { featureState })
}

describe('categorical (mapped-status) mode', () => {
  it('distinguishes unmapped, mapped-zero and mapped-with-fragments', () => {
    expect(colorFor(null, UNMAPPED)).toBe(COLOR_UNMAPPED)
    expect(colorFor(null, MAPPED_ZERO)).toBe(COLOR_MAPPED_ZERO)
    expect(
      colorFor(null, { findspotCount: 3, accessibleFragmentCount: 7 }),
    ).toBe(COLOR_MAPPED_FRAGMENTS)
  })

  it('gives selection precedence over every other state', () => {
    expect(
      colorFor(null, { ...MAPPED_ZERO, selected: true, hover: true }),
    ).toBe(COLOR_SELECTED)
  })

  it('treats a feature without state as unmapped', () => {
    expect(colorFor(null, {})).toBe(COLOR_UNMAPPED)
  })
})

describe('classed choropleth colour', () => {
  it.each([
    [1, SEQUENTIAL_COLORS[0]],
    [2, SEQUENTIAL_COLORS[1]],
    [4, SEQUENTIAL_COLORS[1]],
    [5, SEQUENTIAL_COLORS[2]],
    [10, SEQUENTIAL_COLORS[3]],
    [20, SEQUENTIAL_COLORS[4]],
    [900, SEQUENTIAL_COLORS[4]],
  ])('places %s in its class', (count, expected) => {
    expect(
      colorFor(scale, { findspotCount: 1, accessibleFragmentCount: count }),
    ).toBe(expected)
  })

  it('keeps unmapped polygons out of the classed ramp', () => {
    expect(colorFor(scale, UNMAPPED)).toBe(COLOR_UNMAPPED)
  })

  it('keeps mapped polygons with no accessible fragments distinct', () => {
    expect(colorFor(scale, MAPPED_ZERO)).toBe(COLOR_MAPPED_ZERO)
  })

  it('gives selection precedence over the classed ramp', () => {
    expect(
      colorFor(scale, {
        findspotCount: 1,
        accessibleFragmentCount: 900,
        selected: true,
      }),
    ).toBe(COLOR_SELECTED)
  })

  it('reads the density value key when the scale uses it', () => {
    const densityScale: ChoroplethScale = {
      ...scale,
      valueKey: 'densityPerSquareKm',
    }

    expect(
      evaluateExpression(excavationFillColor(densityScale), {
        featureState: {
          findspotCount: 1,
          accessibleFragmentCount: 0,
          densityPerSquareKm: 11,
        },
      }),
    ).toBe(SEQUENTIAL_COLORS[3])
  })
})

describe('fill opacity precedence', () => {
  const opacityFor = (featureState: Record<string, unknown>): unknown =>
    evaluateExpression(excavationFillOpacity(scale), { featureState })

  it('orders selected above hover above data state', () => {
    expect(opacityFor({ selected: true, hover: true, findspotCount: 0 })).toBe(
      0.4,
    )
    expect(opacityFor({ hover: true, findspotCount: 0 })).toBe(0.32)
    expect(opacityFor(UNMAPPED)).toBe(0.07)
    expect(opacityFor(MAPPED_ZERO)).toBe(0.34)
  })

  it('uses a flatter opacity in categorical mode', () => {
    expect(
      evaluateExpression(excavationFillOpacity(null), {
        featureState: MAPPED_ZERO,
      }),
    ).toBe(0.24)
  })
})

describe('non-colour encodings', () => {
  it('encodes the choropleth class in outline width', () => {
    const widthFor = (count: number): unknown =>
      evaluateExpression(excavationOutlineWidth(scale), {
        featureState: { findspotCount: 1, accessibleFragmentCount: count },
      })

    expect(widthFor(1)).toBeCloseTo(1.2)
    expect(widthFor(5)).toBeCloseTo(2.6)
    expect(widthFor(20)).toBeCloseTo(4.0)
  })

  it('keeps hover and selection widths above every data class', () => {
    expect(
      evaluateExpression(excavationOutlineWidth(scale), {
        featureState: { selected: true, accessibleFragmentCount: 0 },
      }),
    ).toBe(3.5)
    expect(
      evaluateExpression(excavationOutlineWidth(scale), {
        featureState: { hover: true, accessibleFragmentCount: 0 },
      }),
    ).toBe(2.4)
    expect(
      evaluateExpression(excavationOutlineWidth(scale), {
        featureState: UNMAPPED,
      }),
    ).toBe(1)
  })

  it('uses constant widths in categorical mode', () => {
    expect(
      evaluateExpression(excavationOutlineWidth(null), {
        featureState: MAPPED_ZERO,
      }),
    ).toBe(1.2)
  })

  it('dashes unmapped outlines and keeps mapped outlines solid', () => {
    expect(
      evaluateExpression(excavationOutlineDash(), { featureState: UNMAPPED }),
    ).toEqual([...DASH_UNMAPPED])
    expect(
      evaluateExpression(excavationOutlineDash(), {
        featureState: MAPPED_ZERO,
      }),
    ).toEqual([...DASH_MAPPED])
  })

  it('separates outline colour and opacity by state', () => {
    expect(
      evaluateExpression(excavationOutlineColor(), {
        featureState: { selected: true },
      }),
    ).toBe(OUTLINE_SELECTED)
    expect(
      evaluateExpression(excavationOutlineColor(), { featureState: UNMAPPED }),
    ).toBe(OUTLINE_UNMAPPED)
    expect(
      evaluateExpression(excavationOutlineOpacity(), {
        featureState: UNMAPPED,
      }),
    ).toBe(0.45)
    expect(
      evaluateExpression(excavationOutlineOpacity(), {
        featureState: MAPPED_ZERO,
      }),
    ).toBe(0.85)
  })
})
