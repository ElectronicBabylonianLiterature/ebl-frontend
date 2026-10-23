import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Chance from 'chance'
import FragmentLink, {
  createFragmentCanonicalUrl,
  createFragmentUrlWithFolio,
  createFragmentUrlWithTab,
  encodeFragmentNumber,
} from 'fragmentarium/ui/FragmentLink'
import Folio from 'fragmentarium/domain/Folio'
import RouterLinkModeContext from 'common/ui/RouterLinkModeContext'
import { CANONICAL_ORIGIN } from 'router/domain'

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

describe('Combined query and hash', () => {
  const museumNumber = 'K.1 / š'
  const hash = 'line 1 & 2#3'
  const folio = new Folio({ name: 'AKG & notes', number: '1/2' })

  test('keeps the selected tab in the query and the line in the hash', () => {
    const url = new URL(
      createFragmentUrlWithTab(museumNumber, 'annotations & photos', hash),
      'https://example.com',
    )

    expect(decodeURIComponent(url.pathname)).toBe(`/library/${museumNumber}`)
    expect(url.searchParams.get('tab')).toBe('annotations & photos')
    expect(decodeURIComponent(url.hash.slice(1))).toBe(hash)
  })

  test('keeps folio metadata in the query when linking to a line', () => {
    const url = new URL(
      createFragmentUrlWithFolio(museumNumber, folio, hash),
      'https://example.com',
    )

    expect(url.searchParams.get('tab')).toBe('folio')
    expect(url.searchParams.get('folioName')).toBe(folio.name)
    expect(url.searchParams.get('folioNumber')).toBe(folio.number)
    expect(decodeURIComponent(url.hash.slice(1))).toBe(hash)
  })

  test('renders a combined folio and line link', () => {
    render(
      <MemoryRouter>
        <FragmentLink number={museumNumber} folio={folio} hash={hash}>
          View folio line
        </FragmentLink>
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: 'View folio line' })
    const url = new URL(link.getAttribute('href') ?? '', 'https://example.com')

    expect(url.searchParams.get('tab')).toBe('folio')
    expect(decodeURIComponent(url.hash.slice(1))).toBe(hash)
  })
})

test('builds a canonical URL for an encoded fragment number', () => {
  expect(createFragmentCanonicalUrl('K.1 / š')).toBe(
    `${CANONICAL_ORIGIN}/library/K.1%20%2F%20%C5%A1`,
  )
})

test('builds a tab link without a hash', () => {
  expect(createFragmentUrlWithTab('K.1', 'notes')).toBe(
    '/library/K.1?tab=notes',
  )
})

test('builds a folio link without a hash', () => {
  expect(
    createFragmentUrlWithFolio('K.1', new Folio({ name: 'AKG', number: '2' })),
  ).toBe('/library/K.1?folioName=AKG&folioNumber=2&tab=folio')
})

test('renders a regular anchor with both folio and hash outside the router', () => {
  render(
    <RouterLinkModeContext.Provider value={false}>
      <FragmentLink
        number="K.1"
        folio={new Folio({ name: 'AKG', number: '2' })}
        hash="line 1"
      >
        View original folio
      </FragmentLink>
    </RouterLinkModeContext.Provider>,
  )

  expect(
    screen.getByRole('link', { name: 'View original folio' }),
  ).toHaveAttribute(
    'href',
    '/library/K.1?folioName=AKG&folioNumber=2&tab=folio#line%201',
  )
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
