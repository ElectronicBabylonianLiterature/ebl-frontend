import React from 'react'
import _ from 'lodash'
import DerivedList from './DerivedList'
import { render, screen } from '@testing-library/react'

import { whenClicked, whenChangedByValue } from 'test-support/utils'
import { Derived } from 'dictionary/domain/Word'
import { derivedFactory } from 'test-support/word-fixtures'

const label = 'Derived'

let value: Derived[][]
let onChange

const setup = (): void => {
  onChange = jest.fn()
  value = [[derivedFactory.build()], [derivedFactory.build()]]
  renderDerivedList()
}

it('Displays all forms', () => {
  setup()
  _(value)
    .flatten()
    .forEach((item) =>
      expect(screen.getByDisplayValue(item.lemma.join(' '))).toBeVisible(),
    )
})

it('Displays label', () => {
  setup()
  expect(screen.getByText(label)).toBeVisible()
})

it('Adds new group when Add is cliked', async () => {
  setup()
  await whenClicked(screen, 'Add group')
    .expect(onChange)
    .toHaveBeenCalledWith([...value, []])
})

it('Calls onChange with updated value on change', () => {
  setup()
  const newValue = value[0][0].homonym === 'IV' ? 'V' : 'IV'
  whenChangedByValue(screen, value[0][0].homonym, newValue)
    .expect(onChange)
    .toHaveBeenCalledWith((newValue) => [
      [
        {
          ...value[0][0],
          homonym: newValue,
        },
      ],
      ..._.tail(value),
    ])
})

function renderDerivedList() {
  render(
    <DerivedList value={value} onChange={onChange}>
      {label}
    </DerivedList>,
  )
}
