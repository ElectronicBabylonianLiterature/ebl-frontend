import { testContainsAllValues } from 'test-support/test-values-complete'
import {
  periodFromAbbreviation,
  periodModifiers,
  PeriodModifiers,
  periods,
  Periods,
  stageFromAbbreviation,
  Stages,
  stageToAbbreviation,
} from 'common/utils/period'

testContainsAllValues(PeriodModifiers, periodModifiers, 'period modifiers')
testContainsAllValues(Periods, periods, 'periods')

describe('periodFromAbbreviation', () => {
  it('returns the stage for a known abbreviation', () => {
    expect(periodFromAbbreviation('SB')).toEqual(Stages['Standard Babylonian'])
  })

  it('throws for an unknown abbreviation', () => {
    expect(() => periodFromAbbreviation('XX')).toThrow(
      'Unknown stage abbreviation: XX',
    )
  })
})

describe('stageFromAbbreviation', () => {
  it('returns the stage name for a known abbreviation', () => {
    expect(stageFromAbbreviation('OB')).toEqual('Old Babylonian')
  })

  it('throws for an unknown abbreviation', () => {
    expect(() => stageFromAbbreviation('XX')).toThrow(
      'Unknown stage abbreviation: XX',
    )
  })
})

describe('stageToAbbreviation', () => {
  it('returns the abbreviation for a known stage', () => {
    expect(stageToAbbreviation('Neo-Assyrian')).toEqual('NA')
  })

  it('throws for an unknown stage', () => {
    expect(() => stageToAbbreviation('Unknown')).toThrow(
      'Unknown stage: Unknown',
    )
  })
})
