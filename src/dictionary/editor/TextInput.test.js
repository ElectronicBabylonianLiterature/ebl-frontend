import React from 'react'
import TextInput from './TextInput'
import {render, cleanup, fireEvent, wait} from 'react-testing-library'

const label = 'Text'
const value = 'text input'
let element
let onChange

afterEach(cleanup)

beforeEach(() => {
  onChange = jest.fn()
  element = renderTextInput()
})

it('Displays value', () => {
  expect(element.getByValue(value)).toBeVisible()
})

it('Displays label', () => {
  expect(element.getByText(label)).toBeVisible()
})

it('Calls onChange with updated value on change', async () => {
  const newValue = 'new'
  const input = element.getByValue(value)
  input.value = newValue
  fireEvent.change(input)

  await wait()

  expect(onChange).toHaveBeenCalledWith(newValue)
})

function renderTextInput () {
  return render(<TextInput id='text' value={value} onChange={onChange}>{label}</TextInput>)
}
