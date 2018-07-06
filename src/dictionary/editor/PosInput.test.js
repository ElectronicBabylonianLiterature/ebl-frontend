import React from 'react'
import PosInput from './PosInput'
import {render, cleanup} from 'react-testing-library'
import _ from 'lodash'
import {factory} from 'factory-girl'
import {whenChanged} from 'testHelpers'

afterEach(cleanup)

let value
let element
let onChange

afterEach(cleanup)

beforeEach(() => {
  onChange = jest.fn()
})

describe('Verb', () => {
  beforeEach(async () => {
    value = await factory.build('verb')
    element = renderPosInput()
  })

  it('Displays all roots', () => {
    value.roots.forEach(root => expect(element.getByValue(root)).toBeVisible())
  })

  it('Calls onChange with updated value on root change', async () => {
    await whenChanged(element, value.roots[0], 'rtr')
      .expect(onChange)
      .toHaveBeenCalledWith(newValue => ({
        roots: [
          newValue,
          ..._.tail(value.roots)
        ]
      }))
  })

  commonTests()
})

describe('Not verb', () => {
  beforeEach(async () => {
    value = await factory.build('word')
    element = renderPosInput()
  })

  commonTests()
})

function commonTests () {
  it('Displays POS', () => {
    expect(element.getByValue(value.pos)).toBeVisible()
  })

  it('Calls onChange with updated value on pos change', async () => {
    await whenChanged(element, value.pos, 'AJ')
      .expect(onChange)
      .toHaveBeenCalledWith(newValue => ({
        pos: newValue
      }))
  })
}

function renderPosInput () {
  return render(<PosInput id='pos' value={value} onChange={onChange} />)
}
