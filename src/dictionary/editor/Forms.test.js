import React from 'react'
import _ from 'lodash'
import Forms from './Forms'
import {render, cleanup, fireEvent, wait} from 'react-testing-library'

afterEach(cleanup)

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
    {lemma: ['a', 'b']},
    {lemma: ['c', 'd']}
  ]
  element = renderForms()
})

it('Displays all forms', () => {
  for (let item of value) {
    expect(element.getByValue(item.lemma.join(' '))).toBeVisible()
  }
})

it('Displays label', () => {
  expect(element.getByText(label)).toBeVisible()
})

it('New entry has given fields', async () => {
  const add = element.getByText('Add form')
  fireEvent.click(add)

  await wait()

  expect(onChange).toHaveBeenCalledWith([...value, {lemma: [], attested: true, homonym: '', notes: []}])
})

it('Removes item when Delete is clicked', async () => {
  const indexToDelete = 1
  const del = element.getAllByText('Delete form')[indexToDelete]
  fireEvent.click(del)

  await wait()

  expect(onChange).toHaveBeenCalledWith(_.reject(value, (value, index) => index === indexToDelete))
})

it('Calls onChange with updated value on change', async () => {
  const newValue = 'new'
  const input = element.getByValue(value[0].lemma.join(' '))
  input.value = newValue
  fireEvent.change(input)

  await wait()

  expect(onChange).toHaveBeenCalledWith([{...value[0], lemma: [newValue]}, ..._.tail(value)])
})

function renderForms () {
  return render(<Forms id='form' value={value} onChange={onChange} fields={['lemma', 'attested', 'homonym', 'notes']}>{label}</Forms>)
}
