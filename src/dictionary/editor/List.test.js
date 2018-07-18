import React from 'react'
import _ from 'lodash'
import List from './List'
import TextInput from './TextInput'
import {render, cleanup} from 'react-testing-library'
import {whenClicked, whenChanged} from 'testHelpers'

afterEach(cleanup)

const label = 'List'
const defaultValue = ''
const id = 'list'
const noun = 'text'
let value
let element
let onChange

afterEach(cleanup)

beforeEach(() => {
  onChange = jest.fn()
})

beforeEach(async () => {
  value = ['text1', 'text2', 'text3']
  element = renderList()
})

it('Displays all items', () => {
  for (let item of value) {
    expect(element.getByValue(item)).toBeVisible()
  }
})

it('Displays label', () => {
  expect(element.getByText(label)).toBeVisible()
})

it('New entry has default value', async () => {
  await whenClicked(element, `Add ${noun}`)
    .expect(onChange)
    .toHaveBeenCalledWith([...value, defaultValue])
})

it('Removes item when Delete is clicked', async () => {
  const indexToDelete = 1
  await whenClicked(element, `Delete ${noun}`, indexToDelete)
    .expect(onChange)
    .toHaveBeenCalledWith(_.reject(value, (value, index) => index === indexToDelete))
})

it('Calls onChange with updated value on change', async () => {
  await whenChanged(element, value[1], 'new')
    .expect(onChange)
    .toHaveBeenCalledWith(newValue => [
      _.head(value),
      newValue,
      ..._.drop(value, 2)
    ])
})

function renderList () {
  return render(
    <List id={id} value={value} onChange={onChange} label={label} noun={noun} default={defaultValue}>
      {value.map((item, index) =>
        <TextInput key={index} value={item} />
      )}
    </List>
  )
}
