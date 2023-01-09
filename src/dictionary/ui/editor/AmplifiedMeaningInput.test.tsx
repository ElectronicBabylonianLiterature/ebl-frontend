import React from 'react'
import _ from 'lodash'
import AmplifiedMeaningInput from './AmplifiedMeaningInput'
import { render, screen } from '@testing-library/react'

import { whenChangedByValue } from 'test-support/utils'
import {
  amplifiedMeaningFactory,
  entryFactory,
} from 'test-support/word-fixtures'

let value
let onChange

beforeEach(() => {
  onChange = jest.fn()
})

describe('Entry', () => {
  beforeEach(async () => {
    value = entryFactory.build()
    renderAmplifiedMeaningInput(true)
  })

  commonDisplayTests()
  commonUpdateTests()
})

describe('Conjugation/Function', () => {
  beforeEach(async () => {
    value = amplifiedMeaningFactory.build()
    renderAmplifiedMeaningInput(false)
  })

  it('Displays key', () => {
    expect(screen.getByDisplayValue(value.key)).toBeVisible()
  })

  it('Displays entries', () => {
    value.entries
      .map((entry) => entry.meaning)
      .forEach((entry) => expect(screen.getByDisplayValue(entry)).toBeVisible())
  })

  it('Calls onChange with updated value on key', () => {
    const newValue = value.key === 'D' ? 'G' : 'D'
    whenChangedByValue(screen, value.key, newValue)
      .expect(onChange)
      .toHaveBeenCalledWith((newValue) => ({
        ...value,
        key: newValue,
      }))
  })

  it('Calls onChange with updated value on entry', async () => {
    whenChangedByValue(screen, value.entries[0].meaning, 'new entry')
      .expect(onChange)
      .toHaveBeenCalledWith((newValue) => ({
        ...value,
        entries: [
          {
            ...value.entries[0],
            meaning: newValue,
          },
          ..._.tail(value.entries),
        ],
      }))
  })

  commonDisplayTests()
  commonUpdateTests()
})

function commonDisplayTests() {
  it('Displays meaning', () => {
    expect(screen.getByDisplayValue(value.meaning)).toBeVisible()
  })

  it('Displays vowels', () => {
    expect(
      screen.getAllByDisplayValue(value.vowels[0].value.join('/'))[0]
    ).toBeVisible()
  })
}

function commonUpdateTests() {
  it('Calls onChange with updated value on meaning chnage', () => {
    whenChangedByValue(screen, value.meaning, 'new meaning')
      .expect(onChange)
      .toHaveBeenCalledWith((newValue) => ({
        ...value,
        meaning: newValue,
      }))
  })

  it('Calls onChange with updated value on vowels change', () => {
    const oldValue = value.vowels[0].value.join('/')
    const newValue = oldValue === 'e/e' ? 'a/e' : 'e/e'
    whenChangedByValue(screen, oldValue, newValue)
      .expect(onChange)
      .toHaveBeenCalledWith((newValue) => ({
        ...value,
        vowels: [
          { ...value.vowels[0], value: newValue.split('/') },
          ..._.tail(value.vowels),
        ],
      }))
  })
}

function renderAmplifiedMeaningInput(entry) {
  return render(
    <AmplifiedMeaningInput value={value} onChange={onChange} entry={entry} />
  )
}
