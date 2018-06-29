import React from 'react'
import _ from 'lodash'
import TextListInput from './TextListInput'
import {render, cleanup} from 'react-testing-library'
import {whenClicked, whenChanged} from '../../testHelpers'

const label = 'List'

let value
let element
let onChange

afterEach(cleanup)

beforeEach(() => {
  onChange = jest.fn()
})

beforeEach(() => {
  value = [
    'first',
    'second'
  ]
  element = renderListInput()
})

it('Displays all elements', () => {
  for (let item of value) {
    expect(element.getByValue(item)).toBeVisible()
  }
})

it('Displays label', () => {
  expect(element.getByText(label)).toBeVisible()
})

it('Adds emtpy item when Add is clicked', async () => {
  await whenClicked(element, 'Add')
    .expect(onChange)
    .toHaveBeenCalledWith([...value, ''])
})

it('Removes item when Delete is clicked', async () => {
  const indexToDelete = 1
  await whenClicked(element, 'Delete', indexToDelete)
    .expect(onChange)
    .toHaveBeenCalledWith(_.reject(value, (value, index) => index === indexToDelete))
})

it('Calls onChange with updated value on change', async () => {
  await whenChanged(element, value[0], 'new')
    .expect(onChange)
    .toHaveBeenCalledWith(newValue => [
      newValue,
      ..._.tail(value)
    ])
})

function renderListInput () {
  return render(<TextListInput id='list' value={value} onChange={onChange}>{label}</TextListInput>)
}
