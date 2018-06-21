import React from 'react'
import FormInput from './FormInput'
import {render, cleanup, fireEvent, wait} from 'react-testing-library'

let value
let element
let onChange

afterEach(cleanup)

beforeEach(() => {
  onChange = jest.fn()
})

describe('Value has notes and homonym', () => {
  beforeEach(() => {
    value = {
      lemma: ['part1', 'part2'],
      homonym: 'I',
      notes: ['note1', 'note2']
    }
    element = RendedFormInput()
  })

  it('Displays lemma', () => {
    expect(element.getByLabelText('Lemma').value).toEqual(value.lemma.join(' '))
  })

  it('Displays homonym', () => {
    expect(element.getByLabelText('Homonym').value).toEqual(value.homonym)
  })

  it('Displays all notes', () => {
    for (let note of value.notes) {
      expect(element.getByValue(note)).toBeVisible()
    }
  })

  describe('On change', () => {
    it('onChanged is called with updated lemma', async () => {
      const lemma = element.getByLabelText('Lemma')
      const newLemma = 'new lemma'
      lemma.value = newLemma
      fireEvent.change(lemma)

      await wait()

      expect(onChange).toHaveBeenCalledWith({
        ...value,
        lemma: newLemma.split(' ')
      })
    })

    it('onChanged is called with updated homonym', async () => {
      const homonym = element.getByLabelText('Homonym')
      const newHomonym = 'IV'
      homonym.value = newHomonym
      fireEvent.change(homonym)

      await wait()

      expect(onChange).toHaveBeenCalledWith({
        ...value,
        homonym: newHomonym
      })
    })

    it('onChanged is called with updated notes', async () => {
      const add = element.getByText('Add')
      fireEvent.click(add)

      await wait()

      expect(onChange).toHaveBeenCalledWith({
        ...value,
        notes: value.notes.concat('')
      })
    })
  })
})

describe('Value does not have notes or homonym', () => {
  beforeEach(() => {
    value = {
      lemma: ['part1', 'part2']
    }
    element = RendedFormInput()
  })

  it('Displays lemma', () => {
    expect(element.getByLabelText('Lemma').value).toEqual(value.lemma.join(' '))
  })

  it('Does not displays homonym', () => {
    expect(element.container).not.toHaveTextContent('Homonym')
  })

  it('Does not display notes', () => {
    expect(element.container).not.toHaveTextContent('Notes')
  })
})

function RendedFormInput () {
  return render(<FormInput id='form-input' value={value} onChange={onChange} />)
}
