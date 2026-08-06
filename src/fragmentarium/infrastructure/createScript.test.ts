import { createScript } from 'fragmentarium/infrastructure/FragmentRepository'
import { ScriptDto } from 'fragmentarium/domain/fragment'
import { PeriodModifiers, Periods } from 'common/utils/period'

describe('createScript fallback behavior', () => {
  it('maps a known period string to its Period object', () => {
    const dto: ScriptDto = {
      period: 'Old Babylonian',
      periodModifier: 'None',
      uncertain: false,
    }
    const result = createScript(dto)
    expect(result.period).toBe(Periods['Old Babylonian'])
    expect(result.period.abbreviation).toBe('OB')
    expect(result.periodModifier).toBe(PeriodModifiers.None)
  })

  it('falls back to Periods.Uncertain for unrecognized period strings', () => {
    const dto: ScriptDto = {
      period: 'ED IIIb' as unknown as string,
      periodModifier: 'None',
      uncertain: false,
    }
    const result = createScript(dto)
    expect(result.period).toBe(Periods.Uncertain)
    expect(result.period.abbreviation).toBe('Unc')
  })

  it('falls back to Periods.Uncertain when period is not a string', () => {
    const dto = {
      period: null,
      periodModifier: 'None',
      uncertain: false,
    } as unknown as ScriptDto
    const result = createScript(dto)
    expect(result.period).toBe(Periods.Uncertain)
    expect(result.period.abbreviation).toBe('Unc')
  })

  it('falls back to PeriodModifiers.None for unrecognized periodModifier strings', () => {
    const dto: ScriptDto = {
      period: 'Old Babylonian',
      periodModifier: 'VeryLate' as unknown as string,
      uncertain: false,
    }
    const result = createScript(dto)
    expect(result.periodModifier).toBe(PeriodModifiers.None)
  })

  it('falls back to PeriodModifiers.None when periodModifier is not a string', () => {
    const dto = {
      period: 'Old Babylonian',
      periodModifier: null,
      uncertain: false,
    } as unknown as ScriptDto
    const result = createScript(dto)
    expect(result.periodModifier).toBe(PeriodModifiers.None)
  })
})
