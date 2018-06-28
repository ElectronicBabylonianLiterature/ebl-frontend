import React from 'react'
import ArrayInput from './ArrayInput'
import {render, cleanup} from 'react-testing-library'
import {changeValue} from '../../testHelpers'

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
  await changeValue(element, value.join(separator), newValue)

  expect(onChange).toHaveBeenCalledWith(newValue.split(separator))
})

function renderArrayInput () {
  return render(<ArrayInput id='array' value={value} separator={separator} onChange={onChange}>{label}</ArrayInput>)
}
