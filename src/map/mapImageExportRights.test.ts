import { assessImageExport } from 'map/mapImageExportRights'

describe('assessImageExport', () => {
  it('is not allowed until basemap and overlay licensing is confirmed', () => {
    const assessment = assessImageExport()
    expect(assessment.isAllowed).toBe(false)
    expect(assessment.explanation).toMatch(/licensing/i)
  })
})
