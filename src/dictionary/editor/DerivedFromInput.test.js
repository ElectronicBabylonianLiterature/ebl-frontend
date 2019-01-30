import React from 'react'
import DerivedFromInput from './DerivedFromInput'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'
import { whenClicked, whenChangedByValue } from 'testHelpers'

let value
let element
let onChange

beforeEach(() => {
  onChange = jest.fn()
})

describe('Derived from set', () => {
  beforeEach(async () => {
    value = await factory.build('derived')
    element = renderDerivedFromInput()
  })

  it('Displays lemma', () => {
    expect(element.getByValue(value.lemma.join(' '))).toBeVisible()
  })

  it('Displays homonym', () => {
    expect(element.getByValue(value.homonym)).toBeVisible()
  })

  it('Displays all notes', () => {
    value.notes.forEach(note => expect(element.getByValue(note)).toBeVisible())
  })

  it('Does not display add button', () => {
    expect(element.queryByLabelText('Add derived from')).toBeNull()
  })

  it('Removes derived from when Delete is clicked', async () => {
    await whenClicked(element, 'Delete derived from')
      .expect(onChange)
      .toHaveBeenCalledWith(null)
  })

  it('Calls onChange with updated derived from on change', () => {
    const newValue = value.homonym === 'II' ? 'V' : 'II'
    whenChangedByValue(element, value.homonym, newValue)
      .expect(onChange)
      .toHaveBeenCalledWith(newValue => ({
        ...value,
        homonym: newValue
      }))
  })
})

describe('No derived from set', () => {
  beforeEach(() => {
    value = null
    element = renderDerivedFromInput()
  })

  it('Does not display form', () => {
    expect(element.queryByLabelText('Lemma')).toBeNull()
  })

  it('Does not display delete button', () => {
    expect(element.queryByLabelText('Delete derived from')).toBeNull()
  })

  it('Adds derived from whe Add is clicked', async () => {
    await whenClicked(element, 'Add derived from')
      .expect(onChange)
      .toHaveBeenCalledWith({
        lemma: [],
        homonym: '',
        notes: []
      })
  })
})

function renderDerivedFromInput () {
  return render(<DerivedFromInput id='derivedFrom' value={value} onChange={onChange} />)
}
