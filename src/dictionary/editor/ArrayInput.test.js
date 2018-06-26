import React from 'react'
import ArrayInput from './ArrayInput'
import {render, cleanup, fireEvent, wait} from 'react-testing-library'

const label = 'Array'
const value = ['array', 'input']
const separator = ' '
let element
let onChange

afterEach(cleanup)

beforeEach(() => {
  onChange = jest.fn()
  element = renderArrayInput()
})

it('Displays value', () => {
  expect(element.getByValue(value.join(separator))).toBeVisible()
})

it('Displays label', () => {
  expect(element.getByText(label)).toBeVisible()
})

it('Calls onChange with updated value on change', async () => {
  const newValue = 'new value'
  const input = element.getByValue(value.join(separator))
  input.value = newValue
  fireEvent.change(input)

  await wait()

  expect(onChange).toHaveBeenCalledWith(newValue.split(separator))
})

function renderArrayInput () {
  return render(<ArrayInput id='array' value={value} separator={separator} onChange={onChange}>{label}</ArrayInput>)
}
