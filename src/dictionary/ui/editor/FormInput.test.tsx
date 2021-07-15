import React from 'react'
import FormInput from './FormInput'
import { render, screen } from '@testing-library/react'
import { factory } from 'factory-girl'

import { whenClicked, changeValueByLabel } from 'test-support/utils'

let value
let onChange

beforeEach(() => {
  onChange = jest.fn()
})

describe('Value is a derived form', () => {
  beforeEach(async () => {
    value = await factory.build('derived')
    renderFormInput()
  })

  it('Displays homonym', () => {
    expect(screen.getByLabelText('Homonym')).toHaveValue(value.homonym)
  })

  it('onChanged is called with updated homonym', () => {
    const newHomonym = value.homonym === 'IV' ? 'I' : 'IV'
    changeValueByLabel(screen, 'Homonym', newHomonym)

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      homonym: newHomonym,
    })
  })

  commonDisplayTests()
  commonChangeTests()
})

describe('Value is a form', () => {
  beforeEach(async () => {
    value = await factory.build('form')
    renderFormInput()
  })

  it('Does not displays homonym', () => {
    expect(screen.queryByText('Homonym')).not.toBeInTheDocument()
  })

  commonDisplayTests()
  commonChangeTests()
})

function commonDisplayTests() {
  it('Displays lemma', () => {
    expect(screen.getByLabelText('Lemma')).toHaveValue(value.lemma.join(' '))
  })

  it('Displays all notes', () => {
    for (const note of value.notes) {
      expect(screen.getByDisplayValue(note)).toBeVisible()
    }
  })
}

function commonChangeTests() {
  it('onChanged is called with updated lemma', () => {
    const newLemma = 'new lemma'
    changeValueByLabel(screen, 'Lemma', newLemma)

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      lemma: newLemma.split(' '),
    })
  })

  it('onChanged is called with updated notes', async () => {
    await whenClicked(screen, 'Add')
      .expect(onChange)
      .toHaveBeenCalledWith({
        ...value,
        notes: value.notes.concat(''),
      })
  })
}

function renderFormInput() {
  render(<FormInput value={value} onChange={onChange} />)
}
