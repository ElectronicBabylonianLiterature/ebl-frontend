import React from 'react'
import _ from 'lodash'
import { FormControl } from 'react-bootstrap'
import List from './List'
import { render, screen } from '@testing-library/react'
import { whenClicked, whenChangedByValue } from 'test-support/utils'

const label = 'List'
const id = 'list'
const noun = 'text'
const items = ['text1', 'text2', 'text3']
let defaultValue
let onChange

beforeEach(() => {
  onChange = jest.fn()
})

describe('Default is not a function', () => {
  beforeEach(() => {
    defaultValue = ''
  })

  it('New entry has the default value', async () => {
    renderList()
    await whenClicked(screen, `Add ${noun}`)
      .expect(onChange)
      .toHaveBeenCalledWith([...items, defaultValue])
  })

  commonTests()
})

describe('Default is a function', () => {
  beforeEach(() => {
    defaultValue = () => ''
  })

  it('New entry has the default value', async () => {
    renderList()
    await whenClicked(screen, `Add ${noun}`)
      .expect(onChange)
      .toHaveBeenCalledWith([...items, defaultValue()])
  })

  commonTests()
})

function commonTests() {
  it('Displays the label', () => {
    renderList()
    expect(screen.getByText(label)).toBeVisible()
  })

  describe.each(items)('Item %#', (item) => {
    const index = items.indexOf(item)

    it(`Displays the item`, () => {
      renderList()
      expect(screen.getByDisplayValue(item)).toBeVisible()
    })

    it(`Removes the item when Delete is clicked`, async () => {
      renderList()
      await whenClicked(screen, `Delete ${noun}`, index)
        .expect(onChange)
        .toHaveBeenCalledWith(
          _.reject(items, (value, itemIndex) => itemIndex === index),
        )
    })

    it(`Calls onChange with updated value on item change`, () => {
      renderList()
      whenChangedByValue(screen, item, 'new')
        .expect(onChange)
        .toHaveBeenCalledWith((updatedItem) =>
          items.map((item, itemIndex) =>
            itemIndex === index ? updatedItem : item,
          ),
        )
    })
  })
}

function renderList() {
  function TestFormControl({
    onChange,
    value,
  }: {
    onChange: (value: string) => void
    value: string
  }): JSX.Element {
    return (
      <FormControl
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    )
  }
  render(
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
    </List>,
  )
}
