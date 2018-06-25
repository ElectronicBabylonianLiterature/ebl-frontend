import React from 'react'
import EntryInput from './EntryInput'
import {render, cleanup, fireEvent, wait} from 'react-testing-library'

afterEach(cleanup)

const value = {
  meaning: 'meaning',
  vowels: [
    {
      value: ['i', 'i'],
      notes: []
    }
  ]
}
let element
let onChange

afterEach(cleanup)

beforeEach(() => {
  onChange = jest.fn()
  element = renderEntryInput()
})

it('Displays meaning', () => {
  expect(element.getByValue(value.meaning)).toBeVisible()
})

it('Displays vowels', () => {
  expect(element.getByValue(value.vowels[0].value.join('/'))).toBeVisible()
})

it('Calls onChange with updated value on meaning chnage', async () => {
  const newValue = 'new meaning'
  const input = element.getByValue(value.meaning)
  input.value = newValue
  fireEvent.change(input)

  await wait()

  expect(onChange).toHaveBeenCalledWith({...value, meaning: newValue})
})

it('Calls onChange with updated value on vowels change', async () => {
  const newValue = 'e/e'
  const input = element.getByValue(value.vowels[0].value.join('/'))
  input.value = newValue
  fireEvent.change(input)

  await wait()

  expect(onChange).toHaveBeenCalledWith({...value, vowels: [{...value.vowels[0], value: newValue.split('/')}]})
})

function renderEntryInput () {
  return render(<EntryInput id='entry' value={value} onChange={onChange} />)
}
