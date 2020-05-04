import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Chance from 'chance'
import FragmentLink from './FragmentLink'
import Folio from 'fragmentarium/domain/Folio'

const chance = new Chance()
const children = 'A link'
const label = 'Link label'
const number = chance.string()
let element

describe('Without folio', () => {
  beforeEach(() => {
    element = render(
      <MemoryRouter>
        <FragmentLink number={number} aria-label={label}>
          {children}
        </FragmentLink>
      </MemoryRouter>
    )
  })

  it('Links to the fragment', () => {
    expect(element.getByLabelText(label)).toHaveAttribute(
      'href',
      `/fragmentarium/${encodeURIComponent(number)}`
    )
  })

  expectToRenderChildren()
})

describe('With folio', () => {
  const folio = new Folio({
    name: chance.string(),
    number: chance.string(),
  })

  beforeEach(() => {
    element = render(
      <MemoryRouter>
        <FragmentLink number={number} folio={folio} aria-label={label}>
          {children}
        </FragmentLink>
      </MemoryRouter>
    )
  })

  it('Links to the fragment with folio', () => {
    const encodedNumber = encodeURIComponent(number)
    const encodedFolioName = encodeURIComponent(folio.name)
    const encodedFolioNumber = encodeURIComponent(folio.number)
    expect(element.getByLabelText(label)).toHaveAttribute(
      'href',
      `/fragmentarium/${encodedNumber}?folioName=${encodedFolioName}&folioNumber=${encodedFolioNumber}&tab=folio`
    )
  })

  expectToRenderChildren()
})

function expectToRenderChildren() {
  it('Renders children', () => {
    expect(element.container).toHaveTextContent(children)
  })
}
