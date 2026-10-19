import { DateOptionsProps } from 'chronology/application/DateOptionsProps'

export function dateOptionsProps(
  overrides: Partial<DateOptionsProps> = {},
): DateOptionsProps {
  return {
    isSeleucidEra: false,
    isAssyrianDate: false,
    isCalendarFieldDisplayed: false,
    setKing: jest.fn(),
    setKingBroken: jest.fn(),
    setKingUncertain: jest.fn(),
    setEponym: jest.fn(),
    setEponymBroken: jest.fn(),
    setEponymUncertain: jest.fn(),
    setIsSeleucidEra: jest.fn(),
    setIsAssyrianDate: jest.fn(),
    setIsCalenderFieldDisplayed: jest.fn(),
    setUr3Calendar: jest.fn(),
    ...overrides,
  }
}
