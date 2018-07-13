import React from 'react'
import {render, cleanup} from 'react-testing-library'
import {MemoryRouter} from 'react-router-dom'
import FragmentPager from './FragmentPager'

afterEach(cleanup)

const child = 'K.00000'
let number
let nextNumber
let element

function renderPager () {
  element = render(<MemoryRouter><FragmentPager number={number}>{child}</FragmentPager></MemoryRouter>)
}

function commonTests () {
  it('Next links to the "next" fragment', () => {
    expect(element.getByLabelText('Next'))
      .toHaveAttribute('href', `/fragmentarium/${nextNumber}`)
  })

  it('Renders children', () => {
    expect(element.container).toHaveTextContent(child)
  })
}

describe('Number is greater than 1', () => {
  beforeEach(() => {
    number = 'prefix 123'
    nextNumber = 'prefix 124'
    element = render(<MemoryRouter><FragmentPager number={number}>{child}</FragmentPager></MemoryRouter>)
  })

  it('Previous links to the "previous" fragment', () => {
    expect(element.getByLabelText('Previous'))
      .toHaveAttribute('href', '/fragmentarium/prefix 122')
  })

  commonTests()
})

describe('Number is 1', () => {
  beforeEach(() => {
    number = 'prefix 1'
    nextNumber = 'prefix 2'
    renderPager()
  })

  it('Does not have previous', () => {
    expect(element.queryByLabelText('Previous')).toBeNull()
  })

  commonTests()
})
