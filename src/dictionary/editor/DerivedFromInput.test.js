import React from 'react'
import DerivedFromInput from './DerivedFromInput'
import {render, cleanup, fireEvent, wait} from 'react-testing-library'
import {factory} from 'factory-girl'
import {changeValue} from '../../testHelpers'

afterEach(cleanup)

let value
let element
let onChange

afterEach(cleanup)

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
    const del = element.getByText('Delete derived from')
    fireEvent.click(del)

    await wait()

    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('Calls onChange with updated derived from on change', async () => {
    const newValue = 'II'
    await changeValue(element, value.homonym, newValue)

    expect(onChange).toHaveBeenCalledWith({...value, homonym: newValue})
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
    const add = element.getByText('Add derived from')
    fireEvent.click(add)

    await wait()

    expect(onChange).toHaveBeenCalledWith({lemma: [], homonym: '', notes: []})
  })
})

function renderDerivedFromInput () {
  return render(<DerivedFromInput id='derivedFrom' value={value} onChange={onChange} />)
}
