import React from 'react'
import _ from 'lodash'
import TextInput from './TextInput'
import { render } from 'react-testing-library'
import { whenChangedByValue } from 'test-helpers/utils'

const label = 'Text'
const value = 'text input'
let element
let onChange

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

it('Calls onChange with updated value on change', () => {
  whenChangedByValue(element, value, 'new')
    .expect(onChange)
    .toHaveBeenCalledWith(_.identity)
})

function renderTextInput () {
  return render(
    <TextInput value={value} onChange={onChange}>
      {label}
    </TextInput>
  )
}
