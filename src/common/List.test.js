import React from 'react'
import _ from 'lodash'
import { FormControl } from 'react-bootstrap'
import List from './List'
import { render } from 'react-testing-library'
import { whenClicked, whenChangedByValue } from 'test-helpers/utils'

const label = 'List'
const id = 'list'
const noun = 'text'
const items = ['text1', 'text2', 'text3']
let defaultValue
let element
let onChange

beforeEach(() => {
  onChange = jest.fn()
})

describe('Default is not a function', () => {
  beforeEach(async () => {
    defaultValue = ''
    element = renderList()
  })

  it('New entry has the default value', async () => {
    await whenClicked(element, `Add ${noun}`)
      .expect(onChange)
      .toHaveBeenCalledWith([...items, defaultValue])
  })

  commonTests()
})

describe('Default is a function', () => {
  beforeEach(async () => {
    defaultValue = () => ''
    element = renderList()
  })

  it('New entry has the default value', async () => {
    await whenClicked(element, `Add ${noun}`)
      .expect(onChange)
      .toHaveBeenCalledWith([...items, defaultValue()])
  })

  commonTests()
})

function commonTests () {
  it('Displays the label', () => {
    expect(element.getByText(label)).toBeVisible()
  })

  describe.each(items)('Item %#', item => {
    const index = items.indexOf(item)

    it(`Displays the item`, () => {
      expect(element.getByValue(item)).toBeVisible()
    })

    it(`Removes the item when Delete is clicked`, async () => {
      await whenClicked(element, `Delete ${noun}`, index)
        .expect(onChange)
        .toHaveBeenCalledWith(
          _.reject(items, (value, itemIndex) => itemIndex === index)
        )
    })

    it(`Calls onChange with updated value on item change`, () => {
      whenChangedByValue(element, item, 'new')
        .expect(onChange)
        .toHaveBeenCalledWith(updatedItem =>
          items.map((item, itemIndex) =>
            itemIndex === index ? updatedItem : item
          )
        )
    })
  })
}

function renderList () {
  function TestFormControl ({ onChange, value }) {
    return (
      <FormControl
        type='text'
        value={value}
        onChange={event => onChange(event.target.value)}
      />
    )
  }
  return render(
    <List
      id={id}
      value={items}
      onChange={onChange}
      label={label}
      noun={noun}
      defaultValue={defaultValue}
    >
      {(value, onChange) => (
        <TestFormControl value={value} onChange={onChange} />
      )}
    </List>
  )
}
