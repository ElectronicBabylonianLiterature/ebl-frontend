import React from 'react'
import LemmaInput from './LemmaInput'
import { render, fireEvent, screen } from '@testing-library/react'
import { changeValueByLabel } from 'test-support/utils'

let value
let onChange

beforeEach(() => {
  onChange = jest.fn()
})

describe('Value has attested property', () => {
  function setup(): void {
    value = {
      lemma: ['part1', 'part2'],
      attested: true,
    }
    renderLemmaInput()
  }

  it('Displays lemma', () => {
    setup()
    expect(screen.getByLabelText('Lemma')).toHaveValue(value.lemma.join(' '))
  })

  it('Displays attested', () => {
    setup()
    expect(screen.getByLabelText('attested')).toBeChecked()
  })

  describe('On change with attested', () => {
    it('onChanged is called with updated lemma', () => {
      setup()
      const newLemma = 'new lemma'
      changeValueByLabel(screen, 'Lemma', newLemma)

      expect(onChange).toHaveBeenCalledWith({
        lemma: newLemma.split(' '),
        attested: value.attested,
      })
    })

    it('onChanged is called with updated attested', async () => {
      setup()
      const attested = screen.getByLabelText('attested')
      fireEvent.click(attested)

      expect(onChange).toHaveBeenCalledWith({
        lemma: value.lemma,
        attested: !value.attested,
      })
    })
  })
})
describe('Value does not have attested property', () => {
  function setup(): void {
    value = {
      lemma: ['part1', 'part2'],
    }
    renderLemmaInput()
  }

  it('Displays lemma', () => {
    setup()
    expect(screen.getByLabelText('Lemma')).toHaveValue(value.lemma.join(' '))
  })

  it('Does not display attested', () => {
    setup()
    expect(screen.queryByLabelText('attested')).not.toBeInTheDocument()
  })

  describe('On change with attested', () => {
    function setupWithAttested(): void {
      value = {
        lemma: ['part1', 'part2'],
        attested: false,
      }
      renderLemmaInput()
    }

    it('onChanged is called with updated lemma', () => {
      setupWithAttested()
      const newLemma = 'new lemma'
      changeValueByLabel(screen, 'Lemma', newLemma)

      expect(onChange).toHaveBeenCalledWith({
        lemma: newLemma.split(' '),
        attested: value.attested,
      })
    })
  })
})

function renderLemmaInput() {
  render(<LemmaInput value={value} onChange={onChange} />)
}
