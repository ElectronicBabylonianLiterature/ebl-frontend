import React from 'react'
import LemmaInput from './LemmaInput'
import { render, fireEvent, wait } from '@testing-library/react'
import { changeValueByLabel } from 'test-helpers/utils'

let value
let element
let onChange

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
    it('onChanged is called with updated lemma', () => {
      const newLemma = 'new lemma'
      changeValueByLabel(element, 'Lemma', newLemma)

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
    expect(element.queryByLabelText('attested')).toBeNull()
  })

  describe('On change with attested', () => {
    beforeEach(() => {
      value = {
        lemma: ['part1', 'part2'],
        attested: false
      }
      element = renderLemmaInput()
    })

    it('onChanged is called with updated lemma', () => {
      const newLemma = 'new lemma'
      changeValueByLabel(element, 'Lemma', newLemma)

      expect(onChange).toHaveBeenCalledWith({
        lemma: newLemma.split(' ')
      })
    })
  })
})

function renderLemmaInput() {
  return render(<LemmaInput value={value} onChange={onChange} />)
}
