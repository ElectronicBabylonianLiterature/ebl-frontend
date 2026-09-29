import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  DateInputGroups,
  DateOptionsInput,
  DateOptionsProps,
} from 'chronology/ui/DateEditor/DateSelectionInput'
import { eponym } from 'test-support/date-fixtures'

it('Toggles intercalary without a setter', async () => {
  const setMonthValue = jest.fn()
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
      setYearValue: jest.fn(),
      setYearBroken: jest.fn(),
      setYearUncertain: jest.fn(),
      setMonthValue,
      setMonthBroken: jest.fn(),
      setMonthUncertain: jest.fn(),
      setDayValue: jest.fn(),
      setDayBroken: jest.fn(),
      setDayUncertain: jest.fn(),
    }),
  )
  const intercalary = screen.getByLabelText('Intercalary')
  await userEvent.click(intercalary)
  expect(intercalary).not.toBeChecked()
  expect(setMonthValue).not.toHaveBeenCalled()
})

function renderDateOptionsInput(overrides: Partial<DateOptionsProps>): void {
  render(
    <DateOptionsInput
      isSeleucidEra={false}
      isAssyrianDate={false}
      isCalendarFieldDisplayed={false}
      setKing={jest.fn()}
      setKingBroken={jest.fn()}
      setKingUncertain={jest.fn()}
      setEponym={jest.fn()}
      setEponymBroken={jest.fn()}
      setEponymUncertain={jest.fn()}
      setIsSeleucidEra={jest.fn()}
      setIsAssyrianDate={jest.fn()}
      setIsCalenderFieldDisplayed={jest.fn()}
      setUr3Calendar={jest.fn()}
      {...overrides}
    />,
  )
}

it('Starts with the Assyrian phase of the eponym', () => {
  renderDateOptionsInput({
    eponym: { ...eponym, phase: 'MA' },
    isAssyrianDate: true,
  })
  expect(screen.getByLabelText('Middle-Assyrian')).toBeChecked()
})

it('Displays the Ur III calendar field', () => {
  renderDateOptionsInput({ isCalendarFieldDisplayed: true })
  expect(screen.getByLabelText('select-calendar')).toBeInTheDocument()
})
