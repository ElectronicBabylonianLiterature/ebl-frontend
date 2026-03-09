import React from 'react'
import DerivedFromInput from './DerivedFromInput'
import { render, screen } from '@testing-library/react'

import { whenClicked, whenChangedByValue } from 'test-support/utils'
import { derivedFactory } from 'test-support/word-fixtures'

let value
let onChange

beforeEach(() => {
  onChange = jest.fn()
})

describe('Derived from set', () => {
  function setup(): void {
    value = derivedFactory.build()
    renderDerivedFromInput()
  }

  it('Displays lemma', () => {
    setup()
    expect(screen.getByDisplayValue(value.lemma.join(' '))).toBeInTheDocument()
  })

  it('Displays homonym', () => {
    setup()
    expect(screen.getByDisplayValue(value.homonym)).toBeInTheDocument()
  })

  it('Displays all notes', () => {
    setup()
    value.notes.forEach((note) =>
      expect(screen.getByDisplayValue(note)).toBeInTheDocument(),
    )
  })

  it('Does not display add button', () => {
    setup()
    expect(screen.queryByLabelText('Add derived from')).not.toBeInTheDocument()
  })

  it('Removes derived from when Delete is clicked', async () => {
    setup()
    await whenClicked(screen, 'Delete derived from')
      .expect(onChange)
      .toHaveBeenCalledWith(null)
  })

  it('Calls onChange with updated derived from on change', () => {
    setup()
    const newValue = value.homonym === 'II' ? 'V' : 'II'
    whenChangedByValue(screen, value.homonym, newValue)
      .expect(onChange)
      .toHaveBeenCalledWith((newValue) => ({
        ...value,
        homonym: newValue,
      }))
  })
})

describe('No derived from set', () => {
  function setup(): void {
    value = null
    renderDerivedFromInput()
  }

  it('Does not display form', () => {
    setup()
    expect(screen.queryByLabelText('Lemma')).not.toBeInTheDocument()
  })

  it('Does not display delete button', () => {
    setup()
    expect(
      screen.queryByLabelText('Delete derived from'),
    ).not.toBeInTheDocument()
  })

  it('Adds derived from whe Add is clicked', async () => {
    setup()
    await whenClicked(screen, 'Add derived from')
      .expect(onChange)
      .toHaveBeenCalledWith({
        lemma: [],
        homonym: '',
        notes: [],
      })
  })
})

function renderDerivedFromInput() {
  render(<DerivedFromInput value={value} onChange={onChange} />)
}
