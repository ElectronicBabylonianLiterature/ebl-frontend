import React from 'react'
import ArrayInput from './ArrayInput'
import { render } from 'react-testing-library'
import { whenChangedByValue } from 'test-helpers/utils'

const label = 'Array'
const value = ['array', 'input']
const separator = ' '
let element
let onChange

beforeEach(() => {
  onChange = jest.fn()
  element = renderArrayInput()
})

test('Input element', () => {
  expect(element.getByLabelText(label).value).toEqual(value.join(separator))
})

test('Calls onChange with updated value on change', () => {
  whenChangedByValue(element, value.join(separator), 'new value')
    .expect(onChange)
    .toHaveBeenCalledWith(newValue => newValue.split(separator))
})

function renderArrayInput () {
  return render(<ArrayInput id='array' value={value} separator={separator} onChange={onChange}>{label}</ArrayInput>)
}
