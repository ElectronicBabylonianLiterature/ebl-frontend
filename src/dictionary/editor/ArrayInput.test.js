import React from 'react'
import ArrayInput from './ArrayInput'
import { render } from 'react-testing-library'
import { whenChangedByValue } from 'testHelpers'

const label = 'Array'
const value = ['array', 'input']
const separator = ' '
let element
let onChange

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
  await whenChangedByValue(element, value.join(separator), 'new value')
    .expect(onChange)
    .toHaveBeenCalledWith(newValue => newValue.split(separator))
})

function renderArrayInput () {
  return render(<ArrayInput id='array' value={value} separator={separator} onChange={onChange}>{label}</ArrayInput>)
}
