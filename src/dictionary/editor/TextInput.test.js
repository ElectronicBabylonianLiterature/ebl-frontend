import React from 'react'
import _ from 'lodash'
import TextInput from './TextInput'
import { render, cleanup } from 'react-testing-library'
import { whenChanged } from 'testHelpers'

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
  await whenChanged(element, value, 'new')
    .expect(onChange)
    .toHaveBeenCalledWith(_.identity)
})

function renderTextInput () {
  return render(<TextInput id='text' value={value} onChange={onChange}>{label}</TextInput>)
}
