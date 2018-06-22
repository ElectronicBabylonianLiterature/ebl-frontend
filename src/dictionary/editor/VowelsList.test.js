import React from 'react'
import _ from 'lodash'
import VowelsList from './VowelsList'
import {render, cleanup, fireEvent, wait} from 'react-testing-library'

afterEach(cleanup)

const label = 'Vowels'

let value
let element
let onChange

afterEach(cleanup)

beforeEach(() => {
  onChange = jest.fn()
})

beforeEach(() => {
  value = [
    {value: ['i', 'i'], notes: []},
    {value: ['a', 'u'], notes: ['note1', 'note2']}
  ]
  element = renderVowelsList()
})

it('Displays all vowels', () => {
  _(value).map('value').forEach(vowels => expect(element.getByValue(vowels.join('/'))).toBeVisible())
})

it('Displays all notes', () => {
  _(value).flatMap('notes').forEach(note => expect(element.getByValue(note)).toBeVisible())
})

it('Displays label', () => {
  expect(element.getByText(label)).toBeVisible()
})

it('Adds item when Add is clicked', async () => {
  const add = element.getByText('Add vowels')
  fireEvent.click(add)

  await wait()

  expect(onChange).toHaveBeenCalledWith([...value, {value: [], notes: []}])
})

it('Removes item when Delete is clicked', async () => {
  const indexToDelete = 1
  const del = element.getAllByText('Delete vowels')[indexToDelete]
  fireEvent.click(del)

  await wait()

  expect(onChange).toHaveBeenCalledWith(_.reject(value, (value, index) => index === indexToDelete))
})

it('Calls onChange with updated value on vowels change', async () => {
  const newValue = 'e/e'
  const input = element.getByValue(value[0].value.join('/'))
  input.value = newValue
  fireEvent.change(input)

  await wait()

  expect(onChange).toHaveBeenCalledWith([{...value[0], value: newValue.split('/')}, ..._.tail(value)])
})

it('Calls onChange with updated value on notes change', async () => {
  const input = element.getByText('Add')
  fireEvent.click(input)

  await wait()

  expect(onChange).toHaveBeenCalledWith([{...value[0], notes: [...value[0].notes, '']}, ..._.tail(value)])
})

function renderVowelsList () {
  return render(<VowelsList id='vowels' value={value} onChange={onChange}>{label}</VowelsList>)
}
