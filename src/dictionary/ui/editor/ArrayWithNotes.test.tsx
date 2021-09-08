import React from 'react'
import _ from 'lodash'
import ArrayWithNotes from './ArrayWithNotes'
import { render, screen } from '@testing-library/react'
import { whenClicked, whenChangedByValue } from 'test-support/utils'

const noun = 'item'
const property = 'value'
const separator = ' '

let value
let onChange

beforeEach(() => {
  onChange = jest.fn()
  value = {
    [property]: ['LOG1', 'LOG2'],
    notes: ['note1'],
  }
  renderArrayWithNotes()
})

it('Displays all array items', () => {
  expect(
    screen.getByDisplayValue(value[property].join(separator))
  ).toBeVisible()
})

it('Displays all notes', () => {
  value.notes.forEach((note) =>
    expect(screen.getByDisplayValue(note)).toBeVisible()
  )
})

it('Displays label', () => {
  expect(screen.getByText(_.startCase(noun))).toBeVisible()
})

it('Calls onChange with updated property on change', () => {
  whenChangedByValue(screen, value[property].join(separator), 'NEW LOG')
    .expect(onChange)
    .toHaveBeenCalledWith((newValue) => ({
      ...value,
      [property]: newValue.split(separator),
    }))
})

it('Calls onChange with updated notes on change', async () => {
  await whenClicked(screen, 'Add')
    .expect(onChange)
    .toHaveBeenCalledWith({
      ...value,
      notes: [...value.notes, ''],
    })
})

function renderArrayWithNotes() {
  render(
    <ArrayWithNotes
      property={property}
      noun={noun}
      separator={separator}
      value={value}
      onChange={onChange}
    />
  )
}
