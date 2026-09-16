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
  it.each([
    ['OB', Periods['Old Babylonian']],
    ['LB', Periods['Late Babylonian']],
    ['', Periods.None],
    ['Old Babylonian', Periods['Old Babylonian']],
  ])('maps period value %p to its canonical Period', (period, expected) => {
    const result = createScript({
      period,
      periodModifier: 'None',
      uncertain: false,
    })

    expect(result.period).toBe(expected)
    expect(result.periodModifier).toBe(PeriodModifiers.None)
  })

  it('preserves period modifiers and uncertainty with abbreviations', () => {
    const result = createScript({
      period: 'OB',
      periodModifier: 'Late',
      uncertain: true,
    })

    expect(result.period).toBe(Periods['Old Babylonian'])
    expect(result.periodModifier).toBe(PeriodModifiers.Late)
    expect(result.uncertain).toBe(true)
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
