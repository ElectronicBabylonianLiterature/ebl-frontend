import React from 'react'
import PosInput from './PosInput'
import {render, cleanup, fireEvent, wait} from 'react-testing-library'
import _ from 'lodash'

afterEach(cleanup)

let value
let element
let onChange

afterEach(cleanup)

beforeEach(() => {
  onChange = jest.fn()
})

describe('Verb', () => {
  beforeEach(() => {
    value = {
      pos: 'V',
      roots: ['rrr', 'ttt']
    }
    element = renderPosInput()
  })

  it('Displays all roots', () => {
    value.roots.forEach(root => expect(element.getByValue(root)).toBeVisible())
  })

  it('Calls onChange with updated value on root change', async () => {
    const newValue = 'rtr'
    const input = element.getByValue(value.roots[0])
    input.value = newValue
    fireEvent.change(input)

    await wait()

    expect(onChange).toHaveBeenCalledWith({roots: [newValue, ..._.tail(value.roots)]})
  })

  commonTests()
})

describe('No derived from set', () => {
  beforeEach(() => {
    value = {
      pos: 'V',
      roots: ['rrr', 'ttt']
    }
    element = renderPosInput()
  })

  commonTests()
})

function commonTests () {
  it('Displays POS', () => {
    expect(element.getByValue(value.pos)).toBeVisible()
  })

  it('Calls onChange with updated value on pos change', async () => {
    const newValue = 'AJ'
    const input = element.getByLabelText('Position of speech')
    input.value = newValue
    fireEvent.change(input)

    await wait()

    expect(onChange).toHaveBeenCalledWith({pos: newValue})
  })
}

function renderPosInput () {
  return render(<PosInput id='pos' value={value} onChange={onChange} />)
}
