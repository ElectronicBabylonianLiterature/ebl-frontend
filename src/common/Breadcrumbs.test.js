import React from 'react'
import { render } from 'react-testing-library'
import { MemoryRouter } from 'react-router-dom'
import Breadcrumbs from './Breadcrumbs'

let element

describe('Section and active given', () => {
  beforeEach(() => {
    element = render(<MemoryRouter><Breadcrumbs section='Dictionary' active='Active' /></MemoryRouter>)
  })

  it('Links to the section', async () => {
    expect(element.getByText('Dictionary'))
      .toHaveAttribute('href', `/dictionary`)
  })

  it('Displays active', async () => {
    expect(element.container).toHaveTextContent('Active')
  })

  commonTests()
})

describe('Section without a link', () => {
  beforeEach(() => {
    element = render(<MemoryRouter><Breadcrumbs section='The Section' /></MemoryRouter>)
  })

  it('Shows section without a link', async () => {
    expect(element.getByText('The Section'))
      .not.toHaveAttribute('href')
  })

  commonTests()
})

function commonTests () {
  it('Links to home', async () => {
    expect(element.getByText('eBL'))
      .toHaveAttribute('href', `/`)
  })
}
