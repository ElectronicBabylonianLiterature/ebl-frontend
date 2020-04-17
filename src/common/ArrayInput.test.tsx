import React from 'react'
import ArrayInput from './ArrayInput'
import { render } from '@testing-library/react'
import { whenChangedByValue } from 'test-helpers/utils'

const label = 'Array'
const value = ['array', 'input']
const separator = ' '
let element
let onChange

beforeEach(() => {
  onChange = jest.fn()
})

test('Input element', () => {
  element = renderArrayInput(value)
  expect(element.getByLabelText(label).value).toEqual(value.join(separator))
})

test('Displays empty input on empty array', () => {
  element = renderArrayInput([])
  expect(element.getByLabelText(label).value).toEqual('')
})

test('Calls onChange with updated value on change', () => {
  element = renderArrayInput(value)
  whenChangedByValue(element, value.join(separator), 'new value')
    .expect(onChange)
    .toHaveBeenCalledWith((newValue) => newValue.split(separator))
})

test('Calls onChange with empty array on empty value', () => {
  element = renderArrayInput(value)
  whenChangedByValue(element, value.join(separator), '')
    .expect(onChange)
    .toHaveBeenCalledWith((newValue) => [])
})

function renderArrayInput(value) {
  return render(
    <ArrayInput value={value} separator={separator} onChange={onChange}>
      {label}
    </ArrayInput>
  )
}
