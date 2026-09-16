import { evaluateExpression } from 'test-support/mapExpressionEvaluator'
import {
  COLOR_SELECTED,
  COLOR_UNMAPPED,
  DASH_MAPPED,
  DASH_UNMAPPED,
  OUTLINE_SELECTED,
  OUTLINE_UNMAPPED,
} from './mapPaintColors'
import {
  COLOR_EVIDENCE_CURATED,
  COLOR_EVIDENCE_MIXED,
  COLOR_EVIDENCE_VERIFIED,
  DASH_MIXED,
  EVIDENCE_CODES,
  OUTLINE_EVIDENCE_CURATED,
  OUTLINE_EVIDENCE_MIXED,
  OUTLINE_EVIDENCE_VERIFIED,
  evidenceFillColor,
  evidenceFillOpacity,
  evidenceOutlineColor,
  evidenceOutlineDash,
  evidenceOutlineOpacity,
  evidenceOutlineWidth,
} from './mapEvidencePaint'

function stateFor(
  evidence: keyof typeof EVIDENCE_CODES,
  accessibleFragmentCount = 4,
): Record<string, unknown> {
  return { evidenceCode: EVIDENCE_CODES[evidence], accessibleFragmentCount }
}

const evaluate = (
  expression: unknown,
  featureState: Record<string, unknown>,
): unknown => evaluateExpression(expression, { featureState })

describe('evidence fill colour', () => {
  it.each([
    ['unmapped', COLOR_UNMAPPED],
    ['verified-source', COLOR_EVIDENCE_VERIFIED],
    ['curated', COLOR_EVIDENCE_CURATED],
    ['mixed', COLOR_EVIDENCE_MIXED],
  ] as const)('paints %s distinctly', (evidence, expected) => {
    expect(evaluate(evidenceFillColor(), stateFor(evidence))).toBe(expected)
  })

  it('gives selection precedence over every evidence state', () => {
    expect(
      evaluate(evidenceFillColor(), {
        ...stateFor('curated'),
        selected: true,
        hover: true,
      }),
    ).toBe(COLOR_SELECTED)
  })

  it('treats a feature without state as unmapped', () => {
    expect(evaluate(evidenceFillColor(), {})).toBe(COLOR_UNMAPPED)
  })
})

describe('evidence fill opacity', () => {
  it('orders selected above hover above every data state', () => {
    expect(
      evaluate(evidenceFillOpacity(), {
        ...stateFor('curated'),
        selected: true,
        hover: true,
      }),
    ).toBe(0.4)
    expect(
      evaluate(evidenceFillOpacity(), { ...stateFor('curated'), hover: true }),
    ).toBe(0.34)
  })

  it('keeps an unmapped polygon nearly transparent', () => {
    expect(evaluate(evidenceFillOpacity(), stateFor('unmapped', 0))).toBe(0.07)
  })

  it('subdues a mapped polygon with zero fragments without unmapping it', () => {
    expect(
      evaluate(evidenceFillOpacity(), stateFor('verified-source', 0)),
    ).toBe(0.16)
    expect(evaluate(evidenceFillColor(), stateFor('verified-source', 0))).toBe(
      COLOR_EVIDENCE_VERIFIED,
    )
  })

  it('uses the full fill for a mapped polygon with fragments', () => {
    expect(evaluate(evidenceFillOpacity(), stateFor('curated'))).toBe(0.3)
  })
})

describe('non-colour evidence encodings', () => {
  it.each([
    ['unmapped', OUTLINE_UNMAPPED],
    ['verified-source', OUTLINE_EVIDENCE_VERIFIED],
    ['curated', OUTLINE_EVIDENCE_CURATED],
    ['mixed', OUTLINE_EVIDENCE_MIXED],
  ] as const)('outlines %s distinctly', (evidence, expected) => {
    expect(evaluate(evidenceOutlineColor(), stateFor(evidence))).toBe(expected)
  })

  it('gives the selected outline top priority', () => {
    expect(
      evaluate(evidenceOutlineColor(), {
        ...stateFor('mixed'),
        selected: true,
      }),
    ).toBe(OUTLINE_SELECTED)
  })

  it('distinguishes the evidence states by dash pattern', () => {
    expect(evaluate(evidenceOutlineDash(), stateFor('unmapped'))).toEqual([
      ...DASH_UNMAPPED,
    ])
    expect(
      evaluate(evidenceOutlineDash(), stateFor('verified-source')),
    ).toEqual([...DASH_MAPPED])
    expect(evaluate(evidenceOutlineDash(), stateFor('curated'))).toEqual([
      ...DASH_MAPPED,
    ])
    expect(evaluate(evidenceOutlineDash(), stateFor('mixed'))).toEqual([
      ...DASH_MIXED,
    ])
  })

  it('widens the outline for mixed evidence and for interaction', () => {
    expect(evaluate(evidenceOutlineWidth(), stateFor('unmapped'))).toBe(1)
    expect(evaluate(evidenceOutlineWidth(), stateFor('curated'))).toBe(1.7)
    expect(evaluate(evidenceOutlineWidth(), stateFor('mixed'))).toBe(2.2)
    expect(
      evaluate(evidenceOutlineWidth(), { ...stateFor('mixed'), hover: true }),
    ).toBe(2.4)
    expect(
      evaluate(evidenceOutlineWidth(), {
        ...stateFor('mixed'),
        selected: true,
      }),
    ).toBe(3.5)
  })

  it('separates outline opacity by state', () => {
    expect(
      evaluate(evidenceOutlineOpacity(), {
        ...stateFor('curated'),
        selected: true,
      }),
    ).toBe(0.95)
    expect(evaluate(evidenceOutlineOpacity(), stateFor('unmapped'))).toBe(0.45)
    expect(evaluate(evidenceOutlineOpacity(), stateFor('curated'))).toBe(0.85)
  })
})
