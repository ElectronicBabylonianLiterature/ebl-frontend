import React from 'react'
import _ from 'lodash'
import ArrayWithNotesList from './ArrayWithNotesList'
import {render, cleanup, fireEvent, wait} from 'react-testing-library'

afterEach(cleanup)

const noun = 'logogram'
const property = 'logogram'
const separator = ' '

let value
let element
let onChange

afterEach(cleanup)

beforeEach(() => {
  onChange = jest.fn()
})

beforeEach(() => {
  value = [
    {
      'logogram': ['LOG1', 'LOG2'],
      'notes': ['note1']
    },
    {
      'logogram': [],
      'notes': [
        'note2'
      ]
    }
  ]
  element = renderForms()
})

it('Displays all array items', () => {
  _.map(value, entry => entry[property].join(separator)).forEach(item => expect(element.getByValue(item)).toBeVisible())
})

it('Displays all notes', () => {
  _.flatMap(value, 'notes').forEach(note => expect(element.getByValue(note)).toBeVisible())
})

it('Displays label', () => {
  expect(element.getByText(_.startCase(noun))).toBeVisible()
})

it('Adds new entry when Add is clicked', async () => {
  const add = element.getByText(`Add ${noun}`)
  fireEvent.click(add)

  await wait()

  expect(onChange).toHaveBeenCalledWith([...value, {[property]: [], notes: []}])
})

it('Removes item when Delete is clicked', async () => {
  const indexToDelete = 1
  const del = element.getAllByText(`Delete ${noun}`)[indexToDelete]
  fireEvent.click(del)

  await wait()

  expect(onChange).toHaveBeenCalledWith(_.reject(value, (value, index) => index === indexToDelete))
})

it('Calls onChange with updated property on change', async () => {
  const newValue = 'NEW LOG'
  const input = element.getByValue(value[0].logogram.join(' '))
  input.value = newValue
  fireEvent.change(input)

  await wait()

  expect(onChange).toHaveBeenCalledWith([{...value[0], [property]: newValue.split(' ')}, ..._.tail(value)])
})

it('Calls onChange with updated notes on change', async () => {
  const add = element.getByText('Add')
  fireEvent.click(add)

  await wait()

  expect(onChange).toHaveBeenCalledWith([{...value[0], notes: [...value[0].notes, '']}, ..._.tail(value)])
})

function renderForms () {
  return render(<ArrayWithNotesList
    id='form'
    property={property}
    noun={noun}
    separator={separator}
    value={value}
    onChange={onChange} />)
}
