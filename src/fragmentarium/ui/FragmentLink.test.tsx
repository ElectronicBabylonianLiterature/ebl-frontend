import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Chance from 'chance'
import FragmentLink, {
  encodeFragmentNumber,
} from 'fragmentarium/ui/FragmentLink'
import Folio from 'fragmentarium/domain/Folio'

const chance = new Chance('FragmentLink')
const children = 'A link'
const label = 'Link label'
const number = chance.string()

describe('Without folio', () => {
  function renderFragmentLink(): void {
    render(
      <MemoryRouter>
        <FragmentLink number={number} aria-label={label}>
          {children}
        </FragmentLink>
      </MemoryRouter>,
    )
  }

  it('Links to the fragment', () => {
    renderFragmentLink()
    expect(screen.getByLabelText(label)).toHaveAttribute(
      'href',
      `/library/${encodeURIComponent(number)}`,
    )
  })

  expectToRenderChildren(renderFragmentLink)
})

describe('With folio', () => {
  const folio = new Folio({
    name: chance.string(),
    number: chance.string(),
  })

  function renderFragmentLink(): void {
    render(
      <MemoryRouter>
        <FragmentLink number={number} folio={folio} aria-label={label}>
          {children}
        </FragmentLink>
      </MemoryRouter>,
    )
  }

  it('Links to the fragment with folio', () => {
    renderFragmentLink()
    const encodedNumber = encodeURIComponent(number)
    const encodedFolioName = encodeURIComponent(folio.name)
    const encodedFolioNumber = encodeURIComponent(folio.number)
    expect(screen.getByLabelText(label)).toHaveAttribute(
      'href',
      `/library/${encodedNumber}?folioName=${encodedFolioName}&folioNumber=${encodedFolioNumber}&tab=folio`,
    )
  })

  expectToRenderChildren(renderFragmentLink)
})

describe('With hash', () => {
  const hash = 'line 1'

  function renderFragmentLink(): void {
    render(
      <MemoryRouter>
        <FragmentLink number={number} hash={hash} aria-label={label}>
          {children}
        </FragmentLink>
      </MemoryRouter>,
    )
  }

  it('Links to the fragment', () => {
    renderFragmentLink()
    expect(screen.getByLabelText(label)).toHaveAttribute(
      'href',
      `/library/${encodeURIComponent(number)}#${encodeURIComponent(hash)}`,
    )
  })

  expectToRenderChildren(renderFragmentLink)
})

function expectToRenderChildren(renderFragmentLink: () => void) {
  it('Renders children', () => {
    renderFragmentLink()
    expect(screen.getByText(children)).toBeInTheDocument()
  })
}

describe('encodeFragmentNumber', () => {
  it('replaces lone surrogates before encoding', () => {
    expect(encodeFragmentNumber('K.\uD800')).toBe('K.%EF%BF%BD')
  })

  it('encodes the number as is without String.prototype.toWellFormed', () => {
    const toWellFormed = Object.getOwnPropertyDescriptor(
      String.prototype,
      'toWellFormed',
    )
    Reflect.deleteProperty(String.prototype, 'toWellFormed')
    try {
      expect(encodeFragmentNumber('K.1 a')).toBe('K.1%20a')
    } finally {
      if (toWellFormed) {
        Reflect.defineProperty(String.prototype, 'toWellFormed', toWellFormed)
      }
    }
  })
})
