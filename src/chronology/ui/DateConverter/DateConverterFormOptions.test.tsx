import React from 'react'
import { render, screen } from '@testing-library/react'
import getOptions from 'chronology/ui/DateConverter/DateConverterFormOptions'
import DateConverter from 'chronology/domain/DateConverter'
import { sections } from 'chronology/application/DateConverterFormFieldData'
import data from 'chronology/domain/dateConverterData.json'

it('labels rulers without a known king by their own name', () => {
  const dateConverter = new DateConverter()
  jest.spyOn(dateConverter, 'rulerToBrinkmanKings').mockReturnValue(null)
  const rulerField = sections
    .flatMap((section) => section.fields)
    .filter((field) => field.name === 'ruler')
  render(
    <select aria-label="Ruler">
      {rulerField.flatMap((field) => getOptions({ field, dateConverter }))}
    </select>,
  )

  expect(
    screen
      .getAllByRole('option')
      .map((option) => option.textContent)
      .filter(Boolean),
  ).toEqual(data.rulerName)
})
