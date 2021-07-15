import React from 'react'
import _ from 'lodash'
import TextInput from './TextInput'
import { render, screen } from '@testing-library/react'
import { whenChangedByValue } from 'test-support/utils'

const label = 'Text'
const value = 'text input'
let onChange

beforeEach(() => {
  onChange = jest.fn()
  renderTextInput()
})

it('Displays value', () => {
  expect(screen.getByDisplayValue(value)).toBeVisible()
})

it('Displays label', () => {
  expect(screen.getByText(label)).toBeVisible()
})

it('Calls onChange with updated value on change', () => {
  whenChangedByValue(screen, value, 'new')
    .expect(onChange)
    .toHaveBeenCalledWith(_.identity)
})

function renderTextInput() {
  render(
    <TextInput value={value} onChange={onChange}>
      {label}
    </TextInput>
  )
}
