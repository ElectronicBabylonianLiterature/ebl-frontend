import React from 'react'
import _ from 'lodash'
import { FormControl } from 'react-bootstrap'
import List from './List'
import { render } from 'react-testing-library'
import { whenClicked, whenChangedByValue } from 'testHelpers'

const label = 'List'
const defaultValue = ''
const id = 'list'
const noun = 'text'
const items = ['text1', 'text2', 'text3']
let element
let onChange

beforeEach(() => {
  onChange = jest.fn()
})

beforeEach(async () => {
  element = renderList()
})

it('Displays the label', () => {
  expect(element.getByText(label)).toBeVisible()
})

it('New entry has the default value', async () => {
  await whenClicked(element, `Add ${noun}`)
    .expect(onChange)
    .toHaveBeenCalledWith([...items, defaultValue])
})

describe.each(items)('Item %#', item => {
  const index = items.indexOf(item)

  it(`Displays the item`, () => {
    expect(element.getByValue(item)).toBeVisible()
  })

  it(`Removes the item when Delete is clicked`, async () => {
    await whenClicked(element, `Delete ${noun}`, index)
      .expect(onChange)
      .toHaveBeenCalledWith(_.reject(items, (value, itemIndex) => itemIndex === index))
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

function renderList () {
  function TestFormControl ({ onChange, value }) {
    return <FormControl type='text' value={value} onChange={event => onChange(event.target.value)} />
  }
  return render(
    <List id={id} value={items} onChange={onChange} label={label} noun={noun} default={defaultValue}>
      {items.map((item, index) =>
        <TestFormControl key={index} value={item} />
      )}
    </List>
  )
}
