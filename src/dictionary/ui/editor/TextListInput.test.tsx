import React from 'react'
import _ from 'lodash'
import TextListInput from './TextListInput'
import { render, screen } from '@testing-library/react'
import { whenClicked, whenChangedByValue } from 'test-support/utils'

const label = 'List'

let value
let onChange

function renderListInput() {
  onChange = jest.fn()
  value = ['first', 'second']
  return render(
    <TextListInput value={value} onChange={onChange}>
      {label}
    </TextListInput>,
  )
}

it('Displays all elements', () => {
  renderListInput()
  for (const item of value) {
    expect(screen.getByDisplayValue(item)).toBeVisible()
  }
})

it('Displays label', () => {
  renderListInput()
  expect(screen.getByText(label)).toBeVisible()
})

it('Adds emtpy item when Add is clicked', async () => {
  renderListInput()
  await whenClicked(screen, 'Add')
    .expect(onChange)
    .toHaveBeenCalledWith([...value, ''])
})

it('Calls onChange with updated value on change', () => {
  renderListInput()
  whenChangedByValue(screen, value[0], 'new')
    .expect(onChange)
    .toHaveBeenCalledWith((newValue) => [newValue, ..._.tail(value)])
})
