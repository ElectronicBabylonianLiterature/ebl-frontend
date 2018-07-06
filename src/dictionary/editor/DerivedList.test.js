import React from 'react'
import _ from 'lodash'
import DerivedList from './DerivedList'
import {render, cleanup} from 'react-testing-library'
import {factory} from 'factory-girl'
import {whenClicked, whenChanged} from 'testHelpers'

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
  await whenClicked(element, 'Add group')
    .expect(onChange)
    .toHaveBeenCalledWith([...value, []])
})

it('Calls onChange with updated value on change', async () => {
  await whenChanged(element, value[0][0].homonym, 'IV')
    .expect(onChange)
    .toHaveBeenCalledWith(newValue => [
      [
        {
          ...value[0][0],
          homonym: newValue
        }
      ],
      ..._.tail(value)
    ])
})

function renderDerivedList () {
  return render(<DerivedList id='derived' value={value} onChange={onChange}>{label}</DerivedList>)
}
