import React from 'react'
import _ from 'lodash'
import ArrayWithNotesList from './ArrayWithNotesList'
import { render, screen } from '@testing-library/react'
import { whenClicked, whenChangedByValue } from 'test-support/utils'

const noun = 'log'
const property = 'key'
const separator = '/'
const label = 'Array with notes'

let value
let onChange

beforeEach(() => {
  onChange = jest.fn()
})

beforeEach(() => {
  value = [
    {
      [property]: ['LOG1', 'LOG2'],
      notes: ['note1'],
    },
    {
      [property]: [],
      notes: ['note2'],
    },
  ]
  renderArrayWithNotesList()
})

it('Displays all items', () => {
  _.map(value, (entry) => entry[property].join(separator)).forEach((item) =>
    expect(screen.getByDisplayValue(item)).toBeVisible()
  )
})

it('Displays label', () => {
  expect(screen.getByText(label)).toBeVisible()
})

it('Adds new entry when Add is clicked', async () => {
  await whenClicked(screen, `Add ${noun}`)
    .expect(onChange)
    .toHaveBeenCalledWith([...value, { [property]: [], notes: [] }])
})

it('Calls onChange on change', () => {
  whenChangedByValue(screen, value[0][property].join(separator), 'NEW LOG')
    .expect(onChange)
    .toHaveBeenCalledWith((newValue) => [
      {
        ...value[0],
        [property]: newValue.split(separator),
      },
      ..._.tail(value),
    ])
})

function renderArrayWithNotesList() {
  render(
    <ArrayWithNotesList
      property={property}
      noun={noun}
      separator={separator}
      value={value}
      onChange={onChange}
    >
      {label}
    </ArrayWithNotesList>
  )
}
