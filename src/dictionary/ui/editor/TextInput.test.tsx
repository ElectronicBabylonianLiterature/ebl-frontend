import React from 'react'
import _ from 'lodash'
import TextInput from './TextInput'
import { render, screen } from '@testing-library/react'
import { whenChangedByValue } from 'test-support/utils'

const label = 'Text'
const value = 'text input'
let onChange

function renderTextInput() {
  onChange = jest.fn()
  render(
    <TextInput value={value} onChange={onChange}>
      {label}
    </TextInput>,
  )
}

it('Displays value', () => {
  renderTextInput()
  expect(screen.getByDisplayValue(value)).toBeVisible()
})

it('Displays label', () => {
  renderTextInput()
  expect(screen.getByText(label)).toBeVisible()
})

it('Calls onChange with updated value on change', () => {
  renderTextInput()
  whenChangedByValue(screen, value, 'new')
    .expect(onChange)
    .toHaveBeenCalledWith(_.identity)
})
