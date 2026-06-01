import { REALIA_TYPE_LABELS, RealiaType } from 'realia/domain/RealiaEntry'

describe('REALIA_TYPE_LABELS', () => {
  const expectedTypes: RealiaType[] = [
    'BUILDING_NAME',
    'CELESTIAL_NAME',
    'DIVINE_NAME',
    'ETHNOS_NAME',
    'FIELD_NAME',
    'GEOGRAPHICAL_NAME',
    'MONTH_NAME',
    'OBJECT_NAME',
    'PERSONAL_NAME',
    'ROYAL_NAME',
    'WATERCOURSE_NAME',
    'YEAR_NAME',
  ]

  it('contains all 12 RealiaType values', () => {
    expectedTypes.forEach((type) => {
      expect(REALIA_TYPE_LABELS).toHaveProperty(type)
    })
  })

  it('has exactly 12 keys with no extras', () => {
    expect(Object.keys(REALIA_TYPE_LABELS)).toHaveLength(expectedTypes.length)
  })
})
