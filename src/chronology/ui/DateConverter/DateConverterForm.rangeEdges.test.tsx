import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import DateConverterForm from 'chronology/ui/DateConverter/DateConverterForm'
import DateConverter from 'chronology/domain/DateConverter'

const { earliestDate, latestDate } = new DateConverter()

function optionValues(label: string): number[] {
  return within(screen.getByLabelText(label))
    .getAllByRole('option')
    .map((option) => Number(option.getAttribute('value')))
}

function changeField(label: string, value: number): void {
  fireEvent.change(screen.getByLabelText(label), {
    target: { value: String(value) },
  })
}

it('offers only the months and days from the start of the valid range', () => {
  render(<DateConverterForm />)
  changeField('Year', earliestDate.gregorianYear)
  changeField('Month', earliestDate.gregorianMonth)

  expect(optionValues('Month')[0]).toEqual(earliestDate.gregorianMonth)
  expect(optionValues('Day')[0]).toEqual(earliestDate.gregorianDay)
})

it('offers only the months and days up to the end of the valid range', () => {
  render(<DateConverterForm />)
  changeField('Year', latestDate.gregorianYear)
  changeField('Month', latestDate.gregorianMonth)

  expect(optionValues('Month').slice(-1)[0]).toEqual(latestDate.gregorianMonth)
  expect(optionValues('Day').slice(-1)[0]).toEqual(latestDate.gregorianDay)
})
