import React from 'react'
import _ from 'lodash'
import FormList from './FormList'
import { render, screen } from '@testing-library/react'

import { whenClicked, whenChangedByValue } from 'test-support/utils'
import { formFactory } from 'test-support/word-fixtures'
import { Form } from 'dictionary/domain/Word'

const label = 'List'

let value: Form[]
let onChange

beforeEach(() => {
  onChange = jest.fn()
})

beforeEach(() => {
  value = formFactory.buildList(2)
  renderForms()
})

it('Displays all forms', () => {
  for (const item of value) {
    expect(screen.getByDisplayValue(item.lemma.join(' '))).toBeVisible()
  }
})

it('Displays label', () => {
  expect(screen.getByText(label)).toBeVisible()
})

it('New entry has given fields', async () => {
  await whenClicked(screen, 'Add form')
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
  whenChangedByValue(screen, value[0].lemma.join(' '), 'new')
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
  render(
    <FormList
      value={value}
      onChange={onChange}
      fields={['lemma', 'attested', 'homonym', 'notes']}
    >
      {label}
    </FormList>
  )
}
