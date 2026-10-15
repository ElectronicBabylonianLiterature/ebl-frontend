import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { DateInputGroups } from 'chronology/ui/DateEditor/DateSelectionInput'

describe('Date Input Groups', () => {
  const setYearValue = jest.fn()
  const setYearBroken = jest.fn()
  const setYearUncertain = jest.fn()
  const setYearReconstructed = jest.fn()
  const setYearEmended = jest.fn()
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
        setYearReconstructed,
        setYearEmended,
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
    const yearReconstructedSwitch = screen.getByTestId(
      '0-year-reconstructed-switch',
    )
    const yearEmendedSwitch = screen.getByTestId('0-year-emended-switch')
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
    expect(yearReconstructedSwitch).toBeInTheDocument()
    expect(yearEmendedSwitch).toBeInTheDocument()
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
    await userEvent.click(yearReconstructedSwitch)
    await userEvent.click(yearEmendedSwitch)
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
    expect(setYearReconstructed).toHaveBeenCalledWith(true)
    expect(setYearEmended).toHaveBeenCalledWith(true)
    expect(setMonthValue).toHaveBeenCalledWith('1')
    expect(setIntercalary).toHaveBeenCalledWith(true)
    expect(setMonthBroken).toHaveBeenCalledWith(true)
    expect(setMonthUncertain).toHaveBeenCalledWith(true)
    expect(setDayValue).toHaveBeenCalledWith('1')
    expect(setDayBroken).toHaveBeenCalledWith(true)
    expect(setDayUncertain).toHaveBeenCalledWith(true)
  })

  it('shows non-blocking year warnings for metadata symbols and non-standard values', () => {
    render(
      DateInputGroups({
        yearValue: '<136!?>',
        yearBroken: false,
        yearUncertain: false,
        yearReconstructed: false,
        yearEmended: false,
        monthValue: '',
        monthBroken: false,
        monthUncertain: false,
        dayValue: 'XIV',
        dayBroken: false,
        dayUncertain: false,
        setYearValue,
        setYearBroken,
        setYearUncertain,
        setYearReconstructed,
        setYearEmended,
        setMonthValue,
        setIntercalary,
        setMonthBroken,
        setMonthUncertain,
        setDayValue,
        setDayBroken,
        setDayUncertain,
      }),
    )

    expect(
      screen.getByText(
        'Year contains angle brackets. Use the Reconstructed switch instead.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Year contains !. Use the Emended switch instead.'),
    ).toBeInTheDocument()
    expect(
      screen.getAllByText(
        'Non-standard value may skip date conversion for this field.',
      ),
    ).toHaveLength(2)
  })
})
