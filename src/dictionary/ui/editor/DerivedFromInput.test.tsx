import React from 'react'
import DerivedFromInput from './DerivedFromInput'
import { render, screen } from '@testing-library/react'
import { factory } from 'factory-girl'
import { whenClicked, whenChangedByValue } from 'test-support/utils'

let value
let onChange

beforeEach(() => {
  onChange = jest.fn()
})

describe('Derived from set', () => {
  beforeEach(async () => {
    value = await factory.build('derived')
    renderDerivedFromInput()
  })

  it('Displays lemma', () => {
    expect(screen.getByDisplayValue(value.lemma.join(' '))).toBeInTheDocument()
  })

  it('Displays homonym', () => {
    expect(screen.getByDisplayValue(value.homonym)).toBeInTheDocument()
  })

  it('Displays all notes', () => {
    value.notes.forEach((note) =>
      expect(screen.getByDisplayValue(note)).toBeInTheDocument()
    )
  })

  it('Does not display add button', () => {
    expect(screen.queryByLabelText('Add derived from')).not.toBeInTheDocument()
  })

  it('Removes derived from when Delete is clicked', async () => {
    await whenClicked(screen, 'Delete derived from')
      .expect(onChange)
      .toHaveBeenCalledWith(null)
  })

  it('Calls onChange with updated derived from on change', () => {
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
  beforeEach(() => {
    value = null
    renderDerivedFromInput()
  })

  it('Does not display form', () => {
    expect(screen.queryByLabelText('Lemma')).not.toBeInTheDocument()
  })

  it('Does not display delete button', () => {
    expect(
      screen.queryByLabelText('Delete derived from')
    ).not.toBeInTheDocument()
  })

  it('Adds derived from whe Add is clicked', async () => {
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
