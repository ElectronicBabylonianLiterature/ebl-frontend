import React from 'react'
import _ from 'lodash'
import DerivedList from './DerivedList'
import {render, cleanup, fireEvent, wait} from 'react-testing-library'
import {factory} from 'factory-girl'
import {clickNth} from '../../testHelpers'

afterEach(cleanup)

const label = 'Derived'

let value
let element
let onChange

afterEach(cleanup)

beforeEach(() => {
  onChange = jest.fn()
})

beforeEach(async () => {
  value = [
    [await factory.build('derived')],
    [await factory.build('derived')]
  ]
  element = renderDerivedList()
})

it('Displays all forms', () => {
  _(value).flatten().forEach(item => expect(element.getByValue(item.lemma.join(' '))).toBeVisible())
})

it('Displays label', () => {
  expect(element.getByText(label)).toBeVisible()
})

it('Adds new group when Add is cliked', async () => {
  const add = element.getByText('Add group')
  fireEvent.click(add)

  await wait()

  expect(onChange).toHaveBeenCalledWith([...value, []])
})

it('Removes group when Delete is clicked', async () => {
  const indexToDelete = 1
  await clickNth(element, 'Delete group', indexToDelete)

  expect(onChange).toHaveBeenCalledWith(_.reject(value, (value, index) => index === indexToDelete))
})

it('Calls onChange with updated value on change', async () => {
  const newValue = 'IV'
  const input = element.getByValue(value[0][0].homonym)
  input.value = newValue
  fireEvent.change(input)

  await wait()

  expect(onChange).toHaveBeenCalledWith([[{...value[0][0], homonym: newValue}], ..._.tail(value)])
})

function renderDerivedList () {
  return render(<DerivedList id='derived' value={value} onChange={onChange}>{label}</DerivedList>)
}
