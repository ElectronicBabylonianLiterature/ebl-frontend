import React from 'react'
import _ from 'lodash'
import LogogramList from './LogogramList'
import {render, cleanup, fireEvent, wait} from 'react-testing-library'

afterEach(cleanup)

const label = 'Logograms'

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

it('Displays all logograms', () => {
  _.map(value, ({logogram}) => logogram.join(' ')).forEach(logogram => expect(element.getByValue(logogram)).toBeVisible())
})

it('Displays all notes', () => {
  _.flatMap(value, 'notes').forEach(note => expect(element.getByValue(note)).toBeVisible())
})

it('Displays label', () => {
  expect(element.getByText(label)).toBeVisible()
})

it('Adds new entry when Add is clicked', async () => {
  const add = element.getByText('Add Logogram')
  fireEvent.click(add)

  await wait()

  expect(onChange).toHaveBeenCalledWith([...value, {logogram: [], notes: []}])
})

it('Removes item when Delete is clicked', async () => {
  const indexToDelete = 1
  const del = element.getAllByText('Delete Logogram')[indexToDelete]
  fireEvent.click(del)

  await wait()

  expect(onChange).toHaveBeenCalledWith(_.reject(value, (value, index) => index === indexToDelete))
})

it('Calls onChange with updated logogram on change', async () => {
  const newValue = 'NEW LOG'
  const input = element.getByValue(value[0].logogram.join(' '))
  input.value = newValue
  fireEvent.change(input)

  await wait()

  expect(onChange).toHaveBeenCalledWith([{...value[0], logogram: newValue.split(' ')}, ..._.tail(value)])
})

it('Calls onChange with updated notes on change', async () => {
  const add = element.getByText('Add')
  fireEvent.click(add)

  await wait()

  expect(onChange).toHaveBeenCalledWith([{...value[0], notes: [...value[0].notes, '']}, ..._.tail(value)])
})

function renderForms () {
  return render(<LogogramList id='form' value={value} onChange={onChange} fields={['lemma', 'attested', 'homonym', 'notes']}>{label}</LogogramList>)
}
