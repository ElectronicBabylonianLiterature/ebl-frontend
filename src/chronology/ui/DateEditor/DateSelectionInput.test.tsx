import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import selectEvent from 'react-select-event'
import userEvent from '@testing-library/user-event'
import {
  DateOptionsInput,
  DateInputGroups,
  exportedForTesting,
} from './DateSelectionInput'
import { mesopotamianDateFactory } from 'test-support/date-fixtures'
import { Ur3Calendar } from 'chronology/domain/DateBase'
import { EponymField } from 'chronology/ui/DateEditor/Eponyms'

describe('Date options input', () => {
  it('Renders and handels the date type radios', () => {
    const setIsSeleucidEra = jest.fn()
    const setIsAssyrianDate = jest.fn()
    render(
      <DateOptionsInput
        king={undefined}
        isSeleucidEra={false}
        isCalendarFieldDisplayed={false}
        ur3Calendar={undefined}
        isAssyrianDate={false}
        setKing={jest.fn()}
        setIsSeleucidEra={setIsSeleucidEra}
        setIsCalenderFieldDisplayed={jest.fn()}
        setUr3Calendar={jest.fn()}
        setIsAssyrianDate={setIsAssyrianDate}
        setEponym={jest.fn()}
        setKingBroken={jest.fn()}
        setKingUncertain={jest.fn()}
        setEponymBroken={jest.fn()}
        setEponymUncertain={jest.fn()}
      />,
    )
    const seleucidRadioElem = screen.getByLabelText('Seleucid')
    const assyrianRadioElem = screen.getByLabelText('Assyrian')
    expect(seleucidRadioElem).toBeInTheDocument()
    expect(assyrianRadioElem).toBeInTheDocument()
    seleucidRadioElem.click()
    expect(setIsSeleucidEra).toHaveBeenCalledWith(true)
    assyrianRadioElem.click()
    expect(setIsAssyrianDate).toHaveBeenCalledWith(true)
  })
})

it('Renders and handels the Assyrian phase radios', () => {
  const setAssyrianPhase = jest.fn()
  const assyrianPhase = 'NA'
  render(
    exportedForTesting.getAssyrianDateSwitch({
      setAssyrianPhase,
      assyrianPhase,
    }),
  )
  const neoAssyrianRadioElem = screen.getByLabelText('Neo-Assyrian')
  const middleAssyrianRadioElem = screen.getByLabelText('Middle-Assyrian')
  const oldAssyrianRadioElem = screen.getByLabelText('Old-Assyrian')

  expect(neoAssyrianRadioElem).toBeInTheDocument()
  expect(middleAssyrianRadioElem).toBeInTheDocument()
  expect(oldAssyrianRadioElem).toBeInTheDocument()

  middleAssyrianRadioElem.click()
  expect(setAssyrianPhase).toHaveBeenCalledWith('MA')
  oldAssyrianRadioElem.click()
  expect(setAssyrianPhase).toHaveBeenCalledWith('OA')
})

describe('Ur3 Calendar Field', () => {
  it('Renders and handles the Ur3 Calendar field', async () => {
    const setUr3Calendar = jest.fn()

    render(
      exportedForTesting.getUr3CalendarField({
        king: mesopotamianDateFactory.build({ ur3Calendar: Ur3Calendar.UMMA })
          .king,
        isSeleucidEra: false,
        isCalendarFieldDisplayed: true,
        ur3Calendar: Ur3Calendar.UMMA,
        isAssyrianDate: false,
        setKing: jest.fn(),
        setUr3Calendar,
        setIsSeleucidEra: jest.fn(),
        setIsCalenderFieldDisplayed: jest.fn(),
        setIsAssyrianDate: jest.fn(),
        setEponym: jest.fn(),
        setKingBroken: jest.fn(),
        setKingUncertain: jest.fn(),
        setEponymBroken: jest.fn(),
        setEponymUncertain: jest.fn(),
      }),
    )
    const selectElem = screen.getByLabelText('select-calendar')
    expect(selectElem).toBeInTheDocument()
    const option = screen.getByText('Umma')
    expect(option).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('select-calendar'), 'Umma')
    await selectEvent.select(screen.getByLabelText('select-calendar'), 'Umma')
    await waitFor(() => expect(setUr3Calendar).toHaveBeenCalledWith('Umma'))
  })
})

describe('Date Input Groups', () => {
  const setYearValue = jest.fn()
  const setYearBroken = jest.fn()
  const setYearUncertain = jest.fn()
  const setMonthValue = jest.fn()
  const setMonthBroken = jest.fn()
  const setMonthUncertain = jest.fn()
  const setIntercalary = jest.fn()
  const setDayValue = jest.fn()
  const setDayBroken = jest.fn()
  const setDayUncertain = jest.fn()

  it('Renders year input group', async () => {
    render(
      DateInputGroups({
        yearValue: '',
        yearBroken: false,
        yearUncertain: false,
        monthValue: '',
        monthBroken: false,
        monthUncertain: false,
        dayValue: '',
        dayBroken: false,
        dayUncertain: false,
        setYearValue,
        setYearBroken,
        setYearUncertain,
        setMonthValue,
        setIntercalary,
        setMonthBroken,
        setMonthUncertain,
        setDayValue,
        setDayBroken,
        setDayUncertain,
      }),
    )
    const yearInput = screen.getByLabelText('Year')
    const yearBrokenSwitch = screen.getByTestId('0-year-broken-switch')
    const yearUncertainSwitch = screen.getByTestId('0-year-uncertain-switch')
    const monthInput = screen.getByLabelText('Month')
    const monthIntercalaryCheckbox = screen.getByLabelText('Intercalary')
    const monthBrokenSwitch = screen.getByTestId('0-month-broken-switch')
    const monthUncertainSwitch = screen.getByTestId('0-month-uncertain-switch')
    const dayInput = screen.getByLabelText('Day')
    const dayBrokenSwitch = screen.getByTestId('0-day-broken-switch')
    const dayUncertainSwitch = screen.getByTestId('0-day-uncertain-switch')

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

    await userEvent.type(yearInput, '1')
    await userEvent.click(yearBrokenSwitch)
    await userEvent.click(yearUncertainSwitch)
    await userEvent.type(monthInput, '1')
    await userEvent.click(monthIntercalaryCheckbox)
    await userEvent.click(monthBrokenSwitch)
    await userEvent.click(monthUncertainSwitch)
    await userEvent.type(dayInput, '1')
    await userEvent.click(dayBrokenSwitch)
    await userEvent.click(dayUncertainSwitch)

    expect(setYearValue).toHaveBeenCalledWith('1')
    expect(setYearBroken).toHaveBeenCalledWith(true)
    expect(setYearUncertain).toHaveBeenCalledWith(true)
    expect(setMonthValue).toHaveBeenCalledWith('1')
    expect(setIntercalary).toHaveBeenCalledWith(true)
    expect(setMonthBroken).toHaveBeenCalledWith(true)
    expect(setMonthUncertain).toHaveBeenCalledWith(true)
    expect(setDayValue).toHaveBeenCalledWith('1')
    expect(setDayBroken).toHaveBeenCalledWith(true)
    expect(setDayUncertain).toHaveBeenCalledWith(true)
  })
})

describe('Date options input with Eponyms', () => {
  it('Renders and handles the Eponym selection', () => {
    render(
      <DateOptionsInput
        king={undefined}
        isSeleucidEra={false}
        isCalendarFieldDisplayed={false}
        ur3Calendar={undefined}
        isAssyrianDate={true}
        setKing={jest.fn()}
        setIsSeleucidEra={jest.fn()}
        setIsCalenderFieldDisplayed={jest.fn()}
        setUr3Calendar={jest.fn()}
        setIsAssyrianDate={jest.fn()}
        setEponym={jest.fn()}
        setKingBroken={jest.fn()}
        setKingUncertain={jest.fn()}
        setEponymBroken={jest.fn()}
        setEponymUncertain={jest.fn()}
      />,
    )
    const eponymSelectElem = screen.getByLabelText('select-eponym')
    expect(eponymSelectElem).toBeInTheDocument()
  })
})

describe('EponymField Component', () => {
  it('Renders and handles the Eponym selection', async () => {
    const setEponym = jest.fn()
    render(<EponymField assyrianPhase="NA" setEponym={setEponym} />)
    const eponymSelectElem = screen.getByLabelText('select-eponym')
    expect(eponymSelectElem).toBeInTheDocument()

    await userEvent.type(eponymSelectElem, 'Adad-nērārī (II) (910)')
    await selectEvent.select(eponymSelectElem, 'Adad-nērārī (II) (910)')
    await waitFor(() =>
      expect(setEponym).toHaveBeenCalledWith({
        date: '910',
        isKing: true,
        name: 'Adad-nērārī (II)',
        phase: 'NA',
        title: 'king',
      }),
    )
  })
})
