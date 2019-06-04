import React from 'react'
import _ from 'lodash'
import { Promise } from 'bluebird'
import { FormControl } from 'react-bootstrap'
import List from './List'
import { render } from '@testing-library/react'
import { whenClicked, whenChangedByValue, clickNth } from 'test-helpers/utils'

const label = 'List'
const id = 'list'
const noun = 'text'
const items = ['text1', 'text2', 'text3']
let defaultValue
let element
let onChange
let beforeAdd

beforeEach(() => {
  onChange = jest.fn()
  beforeAdd = null
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

describe('beforeAddIsGiven', () => {
  beforeEach(async () => {
    beforeAdd = jest.fn()
    defaultValue = () => ''
    element = renderList()
  })

  it('New entry has the default value', async () => {
    beforeAdd.mockReturnValue(Promise.resolve())
    await whenClicked(element, `Add ${noun}`)
      .expect(onChange)
      .toHaveBeenCalledWith([...items, defaultValue()])
    expect(beforeAdd).toHaveBeenCalled()
  })

  it('Does not call onChange if beforeAdd is rejected', async () => {
    beforeAdd.mockReturnValue(Promise.reject(new Error()))
    await clickNth(element, `Add ${noun}`)
    expect(onChange).not.toHaveBeenCalled()
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
      expect(element.getByDisplayValue(item)).toBeVisible()
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
      beforeAdd={beforeAdd}
    >
      {(value, onChange) => (
        <TestFormControl value={value} onChange={onChange} />
      )}
    </List>
  )
}
