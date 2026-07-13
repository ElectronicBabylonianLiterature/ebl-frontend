import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RealiaTokenLinks from 'transliteration/ui/RealiaTokenLinks'
import RealiaAnnotationsContext from 'transliteration/ui/RealiaAnnotationsContext'
import RouterLinkModeContext from 'common/ui/RouterLinkModeContext'
import { createRealiaIdLookup } from 'fragmentarium/domain/realiaAnnotations'
import { atfTokenKur } from 'test-support/test-tokens'
import { Token } from 'transliteration/domain/token'

const lookup = createRealiaIdLookup([
  { id: 'Realia-1', realiaId: 'realia_000846' },
])
const annotatedToken: Token = {
  ...atfTokenKur,
  realia: ['Realia-1'],
}

function renderLinks(
  token: Token = annotatedToken,
  useRouterLinks = true,
): HTMLElement {
  return render(
    <MemoryRouter>
      <RouterLinkModeContext.Provider value={useRouterLinks}>
        <RealiaAnnotationsContext.Provider value={lookup}>
          <RealiaTokenLinks token={token} />
        </RealiaAnnotationsContext.Provider>
      </RouterLinkModeContext.Provider>
    </MemoryRouter>,
  ).container
}

describe('RealiaTokenLinks', () => {
  it('links an annotated token to the realia entry', () => {
    renderLinks()
    const link = screen.getByLabelText('realia-link-realia_000846')
    expect(link).toHaveAttribute('href', '/tools/realia/realia_000846')
    expect(link).toHaveTextContent('RlA')
  })

  it('renders nothing for tokens without realia annotations', () => {
    expect(renderLinks(atfTokenKur)).toBeEmptyDOMElement()
  })

  it('renders nothing when router links are disabled', () => {
    expect(renderLinks(annotatedToken, false)).toBeEmptyDOMElement()
  })

  it('renders nothing without a lookup provider', () => {
    const { container } = render(
      <MemoryRouter>
        <RealiaTokenLinks token={annotatedToken} />
      </MemoryRouter>,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
