import React from 'react'
import _ from 'lodash'
import AmplifiedMeaningInput from './AmplifiedMeaningInput'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'
import { whenChangedByValue } from 'test-helpers/utils'

let value
let element
let onChange

beforeEach(() => {
  onChange = jest.fn()
})

describe('Entry', () => {
  beforeEach(async () => {
    value = await factory.build('entry')
    element = renderAmplifiedMeaningInput(true)
  })

  commonDisplayTests()
  commonUpdateTests()
})

describe('Conjugation/Function', () => {
  beforeEach(async () => {
    value = await factory.build('amplifiedMeaning')
    element = renderAmplifiedMeaningInput(false)
  })

  it('Displays key', () => {
    expect(element.getByValue(value.key)).toBeVisible()
  })

  it('Displays entries', () => {
    value.entries.map(entry => entry.meaning).forEach(entry =>
      expect(element.queryByValue(entry)).toBeVisible()
    )
  })

  it('Calls onChange with updated value on key', () => {
    const newValue = value.key === 'D' ? 'G' : 'D'
    whenChangedByValue(element, value.key, newValue)
      .expect(onChange)
      .toHaveBeenCalledWith(newValue => ({
        ...value,
        key: newValue
      }))
  })

  it('Calls onChange with updated value on entry', async () => {
    whenChangedByValue(element, value.entries[0].meaning, 'new entry')
      .expect(onChange)
      .toHaveBeenCalledWith(newValue => ({
        ...value,
        entries: [
          {
            ...value.entries[0],
            meaning: newValue
          },
          ..._.tail(value.entries)
        ]
      }))
  })

  commonDisplayTests()
  commonUpdateTests()
})

function commonDisplayTests () {
  it('Displays meaning', () => {
    expect(element.getByValue(value.meaning)).toBeVisible()
  })

  it('Displays vowels', () => {
    expect(element.getByValue(value.vowels[0].value.join('/'))).toBeVisible()
  })
}

function commonUpdateTests () {
  it('Calls onChange with updated value on meaning chnage', () => {
    whenChangedByValue(element, value.meaning, 'new meaning')
      .expect(onChange)
      .toHaveBeenCalledWith(newValue => ({
        ...value,
        meaning: newValue
      }))
  })

  it('Calls onChange with updated value on vowels change', () => {
    const oldValue = value.vowels[0].value.join('/')
    const newValue = oldValue === 'e/e' ? 'a/e' : 'e/e'
    whenChangedByValue(element, oldValue, newValue)
      .expect(onChange)
      .toHaveBeenCalledWith(newValue => ({
        ...value,
        vowels: [
          { ...value.vowels[0], value: newValue.split('/') },
          ..._.tail(value.vowels)
        ]
      }))
  })
}

function renderAmplifiedMeaningInput (entry) {
  return render(<AmplifiedMeaningInput id='entry' value={value} onChange={onChange} entry={entry} />)
}
