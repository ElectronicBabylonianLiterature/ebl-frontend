import React from 'react'
import LemmaInput from './LemmaInput'
import {render, cleanup} from 'react-testing-library'

let value
let element
let onChanged

afterEach(cleanup)

beforeEach(() => {
  onChanged = jest.fn()
})

describe('Value has attested property', () => {
  beforeEach(() => {
    value = {
      lemma: ['part1', 'part2'],
      attested: true
    }
    element = render(<LemmaInput id='lemma-input' value={value} onChanged={onChanged} />)
  })

  it('Displays lemma', () => {
    expect(element.getByLabelText('Lemma').value).toEqual(value.lemma.join(' '))
  })

  it('Displays attested', () => {
    expect(element.getByLabelText('attested').checked).toEqual(value.attested)
  })
})

describe('Value does not have attested property', () => {
  beforeEach(() => {
    value = {
      lemma: ['part1', 'part2']
    }
    element = render(<LemmaInput controlId='control-id' value={value} />)
  })

  it('Displays lemma', () => {
    expect(element.getByLabelText('Lemma').value).toEqual(value.lemma.join(' '))
  })

  it('Does not display attested', () => {
    expect(element.queryByLabelText('attested')).not.toBeInTheDOM()
  })
})
