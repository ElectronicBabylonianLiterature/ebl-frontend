import React from 'react'
import _ from 'lodash'
import TextListInput from './TextListInput'
import { render, screen } from '@testing-library/react'
import { whenClicked, whenChangedByValue } from 'test-support/utils'

const label = 'List'

let value
let onChange

beforeEach(() => {
  onChange = jest.fn()
})

beforeEach(() => {
  value = ['first', 'second']
  renderListInput()
})

it('Displays all elements', () => {
  for (const item of value) {
    expect(screen.getByDisplayValue(item)).toBeVisible()
  }
})

it('Displays label', () => {
  expect(screen.getByText(label)).toBeVisible()
})

it('Adds emtpy item when Add is clicked', async () => {
  await whenClicked(screen, 'Add')
    .expect(onChange)
    .toHaveBeenCalledWith([...value, ''])
})

it('Calls onChange with updated value on change', () => {
  whenChangedByValue(screen, value[0], 'new')
    .expect(onChange)
    .toHaveBeenCalledWith((newValue) => [newValue, ..._.tail(value)])
})

function renderListInput() {
  return render(
    <TextListInput value={value} onChange={onChange}>
      {label}
    </TextListInput>
  )
}
