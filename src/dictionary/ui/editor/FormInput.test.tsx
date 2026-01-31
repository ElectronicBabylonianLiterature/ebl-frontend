import React from 'react'
import FormInput from './FormInput'
import { render, screen } from '@testing-library/react'

import { whenClicked, changeValueByLabel } from 'test-support/utils'
import { derivedFactory, formFactory } from 'test-support/word-fixtures'

let value
let onChange

beforeEach(() => {
  onChange = jest.fn()
})

describe('Value is a derived form', () => {
  function setup(): void {
    value = derivedFactory.build()
    renderFormInput()
  }

  it('Displays homonym', () => {
    setup()
    expect(screen.getByLabelText('Homonym')).toHaveValue(value.homonym)
  })

  it('onChanged is called with updated homonym', () => {
    setup()
    const newHomonym = value.homonym === 'IV' ? 'I' : 'IV'
    changeValueByLabel(screen, 'Homonym', newHomonym)

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      homonym: newHomonym,
    })
  })

  commonDisplayTests(setup)
  commonChangeTests(setup)
})

describe('Value is a form', () => {
  function setup(): void {
    value = formFactory.build()
    renderFormInput()
  }

  it('Does not displays homonym', () => {
    setup()
    expect(screen.queryByText('Homonym')).not.toBeInTheDocument()
  })

  commonDisplayTests(setup)
  commonChangeTests(setup)
})

function commonDisplayTests(setup: () => void) {
  it('Displays lemma', () => {
    setup()
    expect(screen.getByLabelText('Lemma')).toHaveValue(value.lemma.join(' '))
  })

  it('Displays all notes', () => {
    setup()
    for (const note of value.notes) {
      expect(screen.getByDisplayValue(note)).toBeVisible()
    }
  })
}

function commonChangeTests(setup: () => void) {
  it('onChanged is called with updated lemma', () => {
    setup()
    const newLemma = 'new lemma'
    changeValueByLabel(screen, 'Lemma', newLemma)

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      lemma: newLemma.split(' '),
    })
  })

  it('onChanged is called with updated notes', async () => {
    setup()
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
