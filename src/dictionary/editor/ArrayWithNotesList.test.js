import React from 'react'
import _ from 'lodash'
import ArrayWithNotesList from './ArrayWithNotesList'
import {render, cleanup} from 'react-testing-library'
import {whenClicked, whenChanged} from '../../testHelpers'

afterEach(cleanup)

const noun = 'item'
const property = 'value'
const separator = ' '

let value
let element
let onChange

afterEach(cleanup)

beforeEach(() => {
  onChange = jest.fn()
})

beforeEach(() => {
  value = [
    {
      [property]: ['LOG1', 'LOG2'],
      'notes': ['note1']
    },
    {
      [property]: [],
      'notes': [
        'note2'
      ]
    }
  ]
  element = renderForms()
})

it('Displays all array items', () => {
  _.map(value, entry => entry[property].join(separator)).forEach(item => expect(element.getByValue(item)).toBeVisible())
})

it('Displays all notes', () => {
  _.flatMap(value, 'notes').forEach(note => expect(element.getByValue(note)).toBeVisible())
})

it('Displays label', () => {
  expect(element.getByText(_.startCase(noun))).toBeVisible()
})

it('Adds new entry when Add is clicked', async () => {
  await whenClicked(element, `Add ${noun}`)
    .expect(onChange)
    .toHaveBeenCalledWith([
      ...value,
      {[property]: [], notes: []}
    ])
})

it('Calls onChange with updated property on change', async () => {
  await whenChanged(element, value[0][property].join(' '), 'NEW LOG')
    .expect(onChange)
    .toHaveBeenCalledWith(newValue => [
      {
        ...value[0],
        [property]: newValue.split(' ')
      },
      ..._.tail(value)
    ])
})

it('Calls onChange with updated notes on change', async () => {
  await whenClicked(element, 'Add')
    .expect(onChange)
    .toHaveBeenCalledWith([
      {
        ...value[0],
        notes: [...value[0].notes, '']
      },
      ..._.tail(value)
    ])
})

function renderForms () {
  return render(<ArrayWithNotesList
    id='form'
    property={property}
    noun={noun}
    separator={separator}
    value={value}
    onChange={onChange} />)
}
