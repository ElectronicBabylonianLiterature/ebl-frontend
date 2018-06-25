import React from 'react'
import AmplifiedMeaningInput from './AmplifiedMeaningInput'
import {render, cleanup, fireEvent, wait} from 'react-testing-library'

afterEach(cleanup)

let value
let element
let onChange

afterEach(cleanup)

beforeEach(() => {
  onChange = jest.fn()
})

describe('Entry', () => {
  beforeEach(() => {
    value = {
      meaning: 'meaning',
      vowels: [
        {
          value: ['i', 'i'],
          notes: []
        }
      ]
    }
    element = renderAmplifiedMeaningInput(true)
  })

  commonTests()
})

describe('Conjugation/Function', () => {
  beforeEach(() => {
    value = {
      key: 'G',
      meaning: 'meaning',
      vowels: [
        {
          value: ['i', 'i'],
          notes: []
        }
      ],
      entries: []
    }
    element = renderAmplifiedMeaningInput(false)
  })

  it('Displays key', () => {
    expect(element.getByValue(value.key)).toBeVisible()
  })

  it('Calls onChange with updated value on key', async () => {
    const newValue = 'D'
    const input = element.getByValue(value.key)
    input.value = newValue
    fireEvent.change(input)

    await wait()

    expect(onChange).toHaveBeenCalledWith({...value, key: newValue})
  })

  commonTests()
})

function commonTests () {
  it('Displays meaning', () => {
    expect(element.getByValue(value.meaning)).toBeVisible()
  })

  it('Displays vowels', () => {
    expect(element.getByValue(value.vowels[0].value.join('/'))).toBeVisible()
  })

  it('Calls onChange with updated value on meaning chnage', async () => {
    const newValue = 'new meaning'
    const input = element.getByValue(value.meaning)
    input.value = newValue
    fireEvent.change(input)

    await wait()

    expect(onChange).toHaveBeenCalledWith({...value, meaning: newValue})
  })

  it('Calls onChange with updated value on vowels change', async () => {
    const newValue = 'e/e'
    const input = element.getByValue(value.vowels[0].value.join('/'))
    input.value = newValue
    fireEvent.change(input)

    await wait()

    expect(onChange).toHaveBeenCalledWith({...value, vowels: [{...value.vowels[0], value: newValue.split('/')}]})
  })
}

function renderAmplifiedMeaningInput (entry) {
  return render(<AmplifiedMeaningInput id='entry' value={value} onChange={onChange} entry={entry} />)
}
