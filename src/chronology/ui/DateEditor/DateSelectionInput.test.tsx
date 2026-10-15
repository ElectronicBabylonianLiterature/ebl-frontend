import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import {
  DateOptionsInput,
  exportedForTesting,
} from 'chronology/ui/DateEditor/DateSelectionInput'
import { mesopotamianDateFactory } from 'test-support/date-fixtures'
import { Ur3Calendar } from 'chronology/domain/DateBase'
import { EponymField } from 'chronology/ui/DateEditor/Eponyms'

describe('Date options input', () => {
  it('Renders and handels the date type radios', async () => {
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
    await userEvent.click(seleucidRadioElem)
    expect(setIsSeleucidEra).toHaveBeenCalledWith(true)
    await userEvent.click(assyrianRadioElem)
    expect(setIsAssyrianDate).toHaveBeenCalledWith(true)
  })
})

it('Renders and handels the Assyrian phase radios', async () => {
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

  await userEvent.click(middleAssyrianRadioElem)
  expect(setAssyrianPhase).toHaveBeenCalledWith('MA')
  await userEvent.click(oldAssyrianRadioElem)
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
    const ummaOption = await screen.findByText(
      (text, element) =>
        text === 'Umma' &&
        (element?.getAttribute('class') ?? '').includes('option'),
    )
    await userEvent.click(ummaOption)
    await waitFor(() => expect(setUr3Calendar).toHaveBeenCalledWith('Umma'))
  })
})

describe('Date options input with Eponyms', () => {
  it('Renders and handles the Eponym selection', async () => {
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
    const eponymSelectElem = await screen.findByLabelText('select-eponym')
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

    const eponymOption = await screen.findByText(
      (text, element) =>
        text === 'Adad-nērārī (II) (910)' &&
        (element?.getAttribute('class') ?? '').includes('option'),
    )
    await userEvent.click(eponymOption)
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
