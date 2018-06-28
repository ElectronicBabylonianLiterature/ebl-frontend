import React from 'react'
import _ from 'lodash'
import AmplifiedMeaningInput from './AmplifiedMeaningInput'
import {render, cleanup, fireEvent, wait} from 'react-testing-library'
import {factory} from 'factory-girl'
import {changeValue} from '../../testHelpers'

afterEach(cleanup)

let value
let element
let onChange

afterEach(cleanup)

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

  it('Calls onChange with updated value on key', async () => {
    const newValue = 'D'
    await changeValue(element, value.key, newValue)

    expect(onChange).toHaveBeenCalledWith({...value, key: newValue})
  })

  it('Calls onChange with updated value on entry', async () => {
    const newValue = 'new entry'
    const input = element.getByValue(value.entries[0].meaning)
    input.value = newValue
    fireEvent.change(input)

    await wait()

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      entries: [
        {
          ...value.entries[0],
          meaning: newValue
        },
        ..._.tail(value.entries)
      ]
    })
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
  it('Calls onChange with updated value on meaning chnage', async () => {
    const newValue = 'new meaning'
    await changeValue(element, value.meaning, newValue)

    expect(onChange).toHaveBeenCalledWith({...value, meaning: newValue})
  })

  it('Calls onChange with updated value on vowels change', async () => {
    const newValue = 'e/e'
    await changeValue(element, value.vowels[0].value.join('/'), newValue)

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      vowels: [
        {...value.vowels[0], value: newValue.split('/')},
        ..._.tail(value.vowels)
      ]
    })
  })
}

function renderAmplifiedMeaningInput (entry) {
  return render(<AmplifiedMeaningInput id='entry' value={value} onChange={onChange} entry={entry} />)
}
