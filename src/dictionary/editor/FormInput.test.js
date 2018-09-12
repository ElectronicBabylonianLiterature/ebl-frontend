import React from 'react'
import FormInput from './FormInput'
import { render, cleanup } from 'react-testing-library'
import { factory } from 'factory-girl'

import { whenClicked, changeValueByLabel } from 'testHelpers'

let value
let element
let onChange

afterEach(cleanup)

beforeEach(() => {
  onChange = jest.fn()
})

describe('Value is a derived form', () => {
  beforeEach(async () => {
    value = await factory.build('derived')
    element = RendedFormInput()
  })

  it('Displays homonym', () => {
    expect(element.getByLabelText('Homonym').value).toEqual(value.homonym)
  })

  it('onChanged is called with updated homonym', async () => {
    const newHomonym = 'IV'
    await changeValueByLabel(element, 'Homonym', newHomonym)

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      homonym: newHomonym
    })
  })

  commonDisplayTests()
  commonChangeTests()
})

describe('Value is a form', () => {
  beforeEach(async () => {
    value = await factory.build('form')
    element = RendedFormInput()
  })

  it('Does not displays homonym', () => {
    expect(element.container).not.toHaveTextContent('Homonym')
  })

  commonDisplayTests()
  commonChangeTests()
})

function commonDisplayTests () {
  it('Displays lemma', () => {
    expect(element.getByLabelText('Lemma').value).toEqual(value.lemma.join(' '))
  })

  it('Displays all notes', () => {
    for (let note of value.notes) {
      expect(element.getByValue(note)).toBeVisible()
    }
  })
}

function commonChangeTests () {
  it('onChanged is called with updated lemma', async () => {
    const newLemma = 'new lemma'
    await changeValueByLabel(element, 'Lemma', newLemma)

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      lemma: newLemma.split(' ')
    })
  })

  it('onChanged is called with updated notes', async () => {
    await whenClicked(element, 'Add')
      .expect(onChange)
      .toHaveBeenCalledWith({
        ...value,
        notes: value.notes.concat('')
      })
  })
}

function RendedFormInput () {
  return render(<FormInput id='form-input' value={value} onChange={onChange} />)
}
