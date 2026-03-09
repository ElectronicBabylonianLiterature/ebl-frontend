import React from 'react'
import ArrayInput from './ArrayInput'
import { render, screen } from '@testing-library/react'
import { whenChangedByValue } from 'test-support/utils'

const label = 'Array'
const value = ['array', 'input']
const separator = ' '
let onChange: jest.Mock<void, [readonly string[]]>

beforeEach(() => {
  onChange = jest.fn()
})

test('Input element', () => {
  renderArrayInput(value)
  expect(screen.getByLabelText(label)).toHaveValue(value.join(separator))
})

test('Displays empty input on empty array', () => {
  renderArrayInput([])
  expect(screen.getByLabelText(label)).toHaveValue('')
})

test('Calls onChange with updated value on change', () => {
  renderArrayInput(value)
  whenChangedByValue(screen, value.join(separator), 'new value')
    .expect(onChange)
    .toHaveBeenCalledWith((newValue: string) => newValue.split(separator))
})

test('Calls onChange with empty array on empty value', () => {
  renderArrayInput(value)
  whenChangedByValue(screen, value.join(separator), '')
    .expect(onChange)
    .toHaveBeenCalledWith(() => [])
})

function renderArrayInput(value: string[]) {
  render(
    <ArrayInput value={value} separator={separator} onChange={onChange}>
      {label}
    </ArrayInput>,
  )
}
