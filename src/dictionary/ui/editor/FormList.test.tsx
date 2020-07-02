import React from 'react'
import _ from 'lodash'
import FormList from './FormList'
import { render } from '@testing-library/react'
import { factory } from 'factory-girl'
import { whenClicked, whenChangedByValue } from 'test-support/utils'

const label = 'List'

let value
let element
let onChange

beforeEach(() => {
  onChange = jest.fn()
})

beforeEach(async () => {
  value = await factory.buildMany('form', 2)
  element = renderForms()
})

it('Displays all forms', () => {
  for (const item of value) {
    expect(element.getByDisplayValue(item.lemma.join(' '))).toBeVisible()
  }
})

it('Displays label', () => {
  expect(element.getByText(label)).toBeVisible()
})

it('New entry has given fields', async () => {
  await whenClicked(element, 'Add form')
    .expect(onChange)
    .toHaveBeenCalledWith([
      ...value,
      {
        lemma: [],
        attested: true,
        homonym: '',
        notes: [],
      },
    ])
})

it('Calls onChange with updated value on change', () => {
  whenChangedByValue(element, value[0].lemma.join(' '), 'new')
    .expect(onChange)
    .toHaveBeenCalledWith((newValue) => [
      {
        ...value[0],
        lemma: [newValue],
      },
      ..._.tail(value),
    ])
})

function renderForms() {
  return render(
    <FormList
      value={value}
      onChange={onChange}
      fields={['lemma', 'attested', 'homonym', 'notes']}
    >
      {label}
    </FormList>
  )
}
