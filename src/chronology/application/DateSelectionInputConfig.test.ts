import getDateConfigs from 'chronology/application/DateSelectionInputConfig'
import { DateOptionsProps } from 'chronology/ui/DateEditor/DateOptionsInput'

function createProps(overrides: Partial<DateOptionsProps>): DateOptionsProps {
  return {
    isSeleucidEra: false,
    isAssyrianDate: false,
    isCalendarFieldDisplayed: true,
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

type DateConfig = ReturnType<typeof getDateConfigs>[number]

function regularConfig(props: DateOptionsProps): DateConfig {
  const config = getDateConfigs(props).find(({ id }) => id === 'date-regular')
  if (!config) {
    throw new Error('The regular date option is missing.')
  }
  return config
}

it.each([
  ['Seleucid', { isSeleucidEra: true }],
  ['Assyrian', { isAssyrianDate: true }],
])('switches a %s date back to a regular date', (_name, overrides) => {
  const props = createProps(overrides)
  const config = regularConfig(props)

  expect(config.checked).toBe(false)
  config.onChange()

  expect(props.setIsSeleucidEra).toHaveBeenCalledWith(false)
  expect(props.setIsAssyrianDate).toHaveBeenCalledWith(false)
})

it('marks a date without an era as regular', () => {
  expect(regularConfig(createProps({})).checked).toBe(true)
})
