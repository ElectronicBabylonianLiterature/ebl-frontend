import React from 'react'
import _ from 'lodash'
import AmplifiedMeaningList from './AmplifiedMeaningList'
import {render, cleanup, fireEvent, wait} from 'react-testing-library'

afterEach(cleanup)

const label = 'Amplified Meanings'

let value
let element
let onChange

afterEach(cleanup)

beforeEach(() => {
  onChange = jest.fn()
})

beforeEach(() => {
  value = [
    {meaning: 'meaning1', vowels: []},
    {meaning: 'meaning2', vowels: []}
  ]
  element = renderAmplifiedMeaningList()
})

it('Displays all amplified meanings', () => {
  for (let item of value) {
    expect(element.getByValue(item.meaning)).toBeVisible()
  }
})

it('Displays label', () => {
  expect(element.getByText(label)).toBeVisible()
})

it('New entry has given fields', async () => {
  const add = element.getByText('Add entry')
  fireEvent.click(add)

  await wait()

  expect(onChange).toHaveBeenCalledWith([...value, {meaning: '', vowels: []}])
})

it('Removes item when Delete is clicked', async () => {
  const indexToDelete = 1
  const del = element.getAllByText('Delete entry')[indexToDelete]
  fireEvent.click(del)

  await wait()

  expect(onChange).toHaveBeenCalledWith(_.reject(value, (value, index) => index === indexToDelete))
})

it('Calls onChange with updated value on change', async () => {
  const newValue = 'new'
  const input = element.getByValue(value[0].meaning)
  input.value = newValue
  fireEvent.change(input)

  await wait()

  expect(onChange).toHaveBeenCalledWith([{...value[0], meaning: newValue}, ..._.tail(value)])
})

function renderAmplifiedMeaningList () {
  return render(<AmplifiedMeaningList id='amplifiedMeanings' value={value} onChange={onChange}>{label}</AmplifiedMeaningList>)
}
