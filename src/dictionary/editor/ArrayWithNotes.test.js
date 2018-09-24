import React from 'react'
import _ from 'lodash'
import ArrayWithNotes from './ArrayWithNotes'
import { render } from 'react-testing-library'
import { whenClicked, whenChanged } from 'testHelpers'

const noun = 'item'
const property = 'value'
const separator = ' '

let value
let element
let onChange

beforeEach(() => {
  onChange = jest.fn()
  value = {
    [property]: ['LOG1', 'LOG2'],
    'notes': ['note1']
  }
  element = renderArrayWithNotes()
})

it('Displays all array items', () => {
  expect(element.getByValue(value[property].join(separator))).toBeVisible()
})

it('Displays all notes', () => {
  value.notes.forEach(note => expect(element.getByValue(note)).toBeVisible())
})

it('Displays label', () => {
  expect(element.getByText(_.startCase(noun))).toBeVisible()
})

it('Calls onChange with updated property on change', async () => {
  await whenChanged(element, value[property].join(separator), 'NEW LOG')
    .expect(onChange)
    .toHaveBeenCalledWith(newValue => ({
      ...value,
      [property]: newValue.split(separator)
    }))
})

it('Calls onChange with updated notes on change', async () => {
  await whenClicked(element, 'Add')
    .expect(onChange)
    .toHaveBeenCalledWith({
      ...value,
      notes: [...value.notes, '']
    })
})

function renderArrayWithNotes () {
  return render(<ArrayWithNotes
    id='arrayWithNotes'
    property={property}
    noun={noun}
    separator={separator}
    value={value}
    onChange={onChange} />)
}
