import { historicalMapOverlay } from 'test-support/map-fixtures'
import { validatedHistoricalMapOverlays } from './historicalOverlays'
import {
  assessImageExport,
  hasPendingPublicationRights,
} from './mapImageExportRights'

const CLEARED = historicalMapOverlay({
  id: 'cleared',
  attribution: 'Public domain. Released for reuse.',
})

const PENDING = historicalMapOverlay({
  id: 'pending',
  attribution: 'Supplied to eBL. Publication rights pending confirmation.',
})

describe('hasPendingPublicationRights', () => {
  it('detects the pending-rights marker regardless of case', () => {
    expect(hasPendingPublicationRights(PENDING)).toBe(true)
    expect(
      hasPendingPublicationRights(
        historicalMapOverlay({ attribution: 'RIGHTS PENDING' }),
      ),
    ).toBe(true)
    expect(hasPendingPublicationRights(CLEARED)).toBe(false)
  })

  it('holds for every overlay currently shipped', () => {
    expect(
      validatedHistoricalMapOverlays.every(hasPendingPublicationRights),
    ).toBe(true)
  })
})

describe('assessImageExport', () => {
  it('blocks export while an active overlay has pending rights', () => {
    const assessment = assessImageExport({
      activeOverlays: [CLEARED, PENDING],
      preservesDrawingBuffer: true,
    })

    expect(assessment.isAllowed).toBe(false)
    expect(assessment.blockers).toEqual(['overlay-rights-pending'])
    expect(assessment.blockedOverlayIds).toEqual(['pending'])
    expect(assessment.explanation).toContain('cannot be redistributed')
  })

  it('blocks export when the drawing buffer is not preserved', () => {
    const assessment = assessImageExport({
      activeOverlays: [CLEARED],
      preservesDrawingBuffer: false,
    })

    expect(assessment.blockers).toEqual(['drawing-buffer-not-preserved'])
    expect(assessment.explanation).toContain('preserveDrawingBuffer')
  })

  it('reports both blockers together', () => {
    expect(
      assessImageExport({
        activeOverlays: [PENDING],
        preservesDrawingBuffer: false,
      }).blockers,
    ).toEqual(['overlay-rights-pending', 'drawing-buffer-not-preserved'])
  })

  it('allows export only when nothing blocks it', () => {
    expect(
      assessImageExport({
        activeOverlays: [CLEARED],
        preservesDrawingBuffer: true,
      }),
    ).toEqual({
      isAllowed: true,
      blockers: [],
      blockedOverlayIds: [],
      explanation: '',
    })
  })

  it('allows export with no overlays at all', () => {
    expect(
      assessImageExport({
        activeOverlays: [],
        preservesDrawingBuffer: true,
      }).isAllowed,
    ).toBe(true)
  })
})
