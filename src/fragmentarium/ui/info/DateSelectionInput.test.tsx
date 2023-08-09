import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import selectEvent from 'react-select-event'
import userEvent from '@testing-library/user-event'
import {
  getKingInput,
  getUr3CalendarField,
  getDateInputGroups,
} from './DateSelectionInput'
import { mesopotamianDateFactory } from 'test-support/date-fixtures'
import { Ur3Calendar } from 'fragmentarium/domain/Date'

describe('King Input', () => {
  it('Renders and handels the Seleucid Era switch', () => {
    const setIsSeleucidEra = jest.fn()
    render(
      getKingInput({
        date: mesopotamianDateFactory.build(),
        isSeleucidEra: false,
        isCalendarFieldDisplayed: false,
        ur3Calendar: undefined,
        setKing: jest.fn(),
        setIsSeleucidEra,
        setIsCalenderFieldDisplayed: jest.fn(),
        setUr3Calendar: jest.fn(),
      })
    )
    const switchElem = screen.getByLabelText('Seleucid Era')
    expect(switchElem).toBeInTheDocument()
    switchElem.click()
    expect(setIsSeleucidEra).toHaveBeenCalledWith(true)
  })
})

describe('Ur3 Calendar Field', () => {
  it('Renders and handles the Ur3 Calendar field', async () => {
    const setUr3Calendar = jest.fn()

    render(
      getUr3CalendarField({
        date: mesopotamianDateFactory.build({ ur3Calendar: Ur3Calendar.UMMA }),
        isSeleucidEra: false,
        isCalendarFieldDisplayed: true,
        ur3Calendar: Ur3Calendar.UMMA,
        setKing: jest.fn(),
        setUr3Calendar,
        setIsSeleucidEra: jest.fn(),
        setIsCalenderFieldDisplayed: jest.fn(),
      })
    )
    const selectElem = screen.getByLabelText('select-calendar')
    expect(selectElem).toBeInTheDocument()
    const option = screen.getByText('Umma')
    expect(option).toBeInTheDocument()

    userEvent.type(screen.getByLabelText('select-calendar'), 'Umma')
    await selectEvent.select(screen.getByLabelText('select-calendar'), 'Umma')
    await waitFor(() => expect(setUr3Calendar).toHaveBeenCalledWith('Umma'))
  })
})

describe('Date Input Groups', () => {
  it('Renders year input group', () => {
    render(
      getDateInputGroups({
        yearValue: '',
        yearBroken: false,
        yearUncertain: false,
        monthValue: '',
        monthBroken: false,
        monthUncertain: false,
        dayValue: '',
        dayBroken: false,
        dayUncertain: false,
        setYearValue: jest.fn(),
        setYearBroken: jest.fn(),
        setYearUncertain: jest.fn(),
        setMonthValue: jest.fn(),
        setMonthBroken: jest.fn(),
        setMonthUncertain: jest.fn(),
        setDayValue: jest.fn(),
        setDayBroken: jest.fn(),
        setDayUncertain: jest.fn(),
      })
    )
    const yearInput = screen.getByLabelText('Year')
    const yearBrokenSwitch = screen.getByLabelText('Year-Broken')
    const yearUncertainSwitch = screen.getByLabelText('Year-Uncertain')
    const monthInput = screen.getByLabelText('Month')
    const monthIntercalaryCheckbox = screen.getByLabelText('Intercalary')
    const monthBrokenSwitch = screen.getByLabelText('Month-Broken')
    const monthUncertainSwitch = screen.getByLabelText('Month-Uncertain')
    const dayInput = screen.getByLabelText('Day')
    const dayBrokenSwitch = screen.getByLabelText('Day-Broken')
    const dayUncertainSwitch = screen.getByLabelText('Day-Uncertain')

    expect(yearInput).toBeInTheDocument()
    expect(yearBrokenSwitch).toBeInTheDocument()
    expect(yearUncertainSwitch).toBeInTheDocument()

    expect(monthInput).toBeInTheDocument()
    expect(monthIntercalaryCheckbox).toBeInTheDocument()
    expect(monthBrokenSwitch).toBeInTheDocument()
    expect(monthUncertainSwitch).toBeInTheDocument()

    expect(dayInput).toBeInTheDocument()
    expect(dayBrokenSwitch).toBeInTheDocument()
    expect(dayUncertainSwitch).toBeInTheDocument()
  })
})
