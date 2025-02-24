import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Chance from 'chance'
import FragmentLink from './FragmentLink'
import Folio from 'fragmentarium/domain/Folio'

const chance = new Chance()
const children = 'A link'
const label = 'Link label'
const number = chance.string()

describe('Without folio', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <FragmentLink number={number} aria-label={label}>
          {children}
        </FragmentLink>
      </MemoryRouter>
    )
  })

  it('Links to the fragment', () => {
    expect(screen.getByLabelText(label)).toHaveAttribute(
      'href',
      `/library/${encodeURIComponent(number)}`
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
    render(
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
    expect(screen.getByLabelText(label)).toHaveAttribute(
      'href',
      `/library/${encodedNumber}?folioName=${encodedFolioName}&folioNumber=${encodedFolioNumber}&tab=folio`
    )
  })

  expectToRenderChildren()
})

describe('With hash', () => {
  const hash = 'line 1'

  beforeEach(() => {
    render(
      <MemoryRouter>
        <FragmentLink number={number} hash={hash} aria-label={label}>
          {children}
        </FragmentLink>
      </MemoryRouter>
    )
  })

  it('Links to the fragment', () => {
    expect(screen.getByLabelText(label)).toHaveAttribute(
      'href',
      `/library/${encodeURIComponent(number)}#${encodeURIComponent(hash)}`
    )
  })

  expectToRenderChildren()
})

function expectToRenderChildren() {
  it('Renders children', () => {
    expect(screen.getByText(children)).toBeInTheDocument()
  })
}
