import React from 'react'
import _ from 'lodash'
import { render } from '@testing-library/react'
import { whenClicked, whenChangedByValue } from 'test-support/utils'
import OraccWordsList from './OraccWordsList'

let value
let element
let onChange

beforeEach(() => {
  onChange = jest.fn()
})

beforeEach(() => {
  value = [
    { lemma: 'foo', guideWord: 'bar' },
    { lemma: 'baz', guideWord: '' },
  ]
  element = render(<OraccWordsList value={value} onChange={onChange} />)
})

it('Displays all elements', () => {
  for (const item of value) {
    expect(element.getByDisplayValue(item.lemma)).toBeVisible()
    expect(element.getByDisplayValue(item.guideWord)).toBeVisible()
  }
})

it('Adds emtpy item when Add is clicked', async () => {
  await whenClicked(element, 'Add Oracc word')
    .expect(onChange)
    .toHaveBeenCalledWith([...value, { lemma: '', guideWord: '' }])
})

it('Calls onChange with updated value on change', () => {
  whenChangedByValue(element, value[0].lemma, 'new')
    .expect(onChange)
    .toHaveBeenCalledWith((newValue) => [
      { ...value[0], lemma: 'new' },
      ..._.tail(value),
    ])
})
