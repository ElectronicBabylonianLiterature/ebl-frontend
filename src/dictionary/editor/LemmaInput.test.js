import React from 'react'
import LemmaInput from './LemmaInput'
import {render, cleanup, fireEvent, wait} from 'react-testing-library'

let value
let element
let onChange

afterEach(cleanup)

beforeEach(() => {
  onChange = jest.fn()
})

describe('Value has attested property', () => {
  beforeEach(() => {
    value = {
      lemma: ['part1', 'part2'],
      attested: true
    }
    element = renderLemmaInput()
  })

  it('Displays lemma', () => {
    expect(element.getByLabelText('Lemma').value).toEqual(value.lemma.join(' '))
  })

  it('Displays attested', () => {
    expect(element.getByLabelText('attested').checked).toEqual(value.attested)
  })

  describe('On change with attested', () => {
    it('onChanged is called with updated lemma', async () => {
      const lemma = element.getByLabelText('Lemma')
      const newLemma = 'new lemma'
      lemma.value = newLemma
      fireEvent.change(lemma)

      await wait()

      expect(onChange).toHaveBeenCalledWith({
        lemma: newLemma.split(' '),
        attested: value.attested
      })
    })

    it('onChanged is called with updated attested', async () => {
      const attested = element.getByLabelText('attested')
      fireEvent.click(attested)

      await wait()

      await expect(onChange).toHaveBeenCalledWith({
        lemma: value.lemma,
        attested: !value.attested
      })
    })
  })
})

describe('Value does not have attested property', () => {
  beforeEach(() => {
    value = {
      lemma: ['part1', 'part2']
    }
    element = renderLemmaInput()
  })

  it('Displays lemma', () => {
    expect(element.getByLabelText('Lemma').value).toEqual(value.lemma.join(' '))
  })

  it('Does not display attested', () => {
    expect(element.queryByLabelText('attested')).not.toBeInTheDOM()
  })

  describe('On change with attested', () => {
    beforeEach(() => {
      value = {
        lemma: ['part1', 'part2'],
        attested: false
      }
      element = renderLemmaInput()
    })

    it('onChanged is called with updated lemma', async () => {
      const lemma = element.getByLabelText('Lemma')
      const newLemma = 'new lemma'
      lemma.value = newLemma
      fireEvent.change(lemma)

      await wait()

      expect(onChange).toHaveBeenCalledWith({
        lemma: newLemma.split(' ')
      })
    })
  })
})

function renderLemmaInput () {
  return render(<LemmaInput id='lemma-input' value={value} onChange={onChange} />)
}
