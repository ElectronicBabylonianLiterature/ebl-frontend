import { createScript } from 'fragmentarium/infrastructure/FragmentRepository'
import { fragment } from 'test-support/test-fragment'
import { ScriptDto } from 'fragmentarium/domain/fragment'
import { PeriodModifiers, Periods } from 'common/utils/period'
import {
  apiClient,
  createSummaryItemDto,
  fragmentRepository,
} from 'fragmentarium/infrastructure/fragmentRepository.testSupport'

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

describe('FragmentRepository query summary with unrecognized script', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('produces a render-safe fragment when period is unrecognized', async () => {
    apiClient.fetchJson.mockResolvedValueOnce({
      matchCountTotal: 1,
      items: [
        createSummaryItemDto({
          script: {
            period: 'ED IIIb',
            periodModifier: 'None',
            uncertain: false,
          },
        } as Record<string, unknown>),
      ],
    })

    const result = await fragmentRepository.query({ transliteration: 'kur₂' })
    const item = result.items[0]

    expect(item.fragment?.script.period.abbreviation).toBeDefined()
    expect(item.fragment?.script.period.abbreviation).toBe('Unc')
    expect(item.fragment?.number).toEqual(fragment.number)
    expect(item.fragment?.script.periodModifier).toBe(PeriodModifiers.None)
  })

  it('produces a render-safe fragment when period is null', async () => {
    apiClient.fetchJson.mockResolvedValueOnce({
      matchCountTotal: 1,
      items: [
        createSummaryItemDto({
          script: {
            period: null,
            periodModifier: 'None',
            uncertain: false,
          },
        } as Record<string, unknown>),
      ],
    })

    const result = await fragmentRepository.query({ transliteration: 'kur₂' })
    const item = result.items[0]

    expect(item.fragment?.script.period.abbreviation).toBeDefined()
    expect(item.fragment?.script.period.abbreviation).toBe('Unc')
  })
})
