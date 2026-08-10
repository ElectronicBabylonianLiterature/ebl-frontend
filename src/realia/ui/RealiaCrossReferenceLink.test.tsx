import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { RealiaCrossReference } from 'realia/domain/RealiaEntry'
import { RealiaCrossReferenceLink } from 'realia/ui/RealiaCrossReferenceLink'

function renderLink(
  crossReference: RealiaCrossReference,
  anchor?: string,
): void {
  render(
    <MemoryRouter>
      <RealiaCrossReferenceLink
        crossReference={crossReference}
        anchor={anchor}
      />
    </MemoryRouter>,
  )
}

it('links to the lemma and labels the link with it', () => {
  renderLink({ id: 'realia_000846', lemma: 'Apkallu' })

  expect(screen.getByRole('link', { name: 'Apkallu' })).toHaveAttribute(
    'href',
    '/tools/realia/Apkallu',
  )
})

it('falls back to the realiaId for both the target and the label', () => {
  renderLink({ id: 'realia_000846', lemma: '' })

  expect(screen.getByRole('link', { name: 'realia_000846' })).toHaveAttribute(
    'href',
    '/tools/realia/realia_000846',
  )
})

it('encodes a lemma that is not URL safe', () => {
  renderLink({ id: 'realia_000999', lemma: 'Ištar/Inanna' })

  expect(screen.getByRole('link', { name: 'Ištar/Inanna' })).toHaveAttribute(
    'href',
    '/tools/realia/I%C5%A1tar%2FInanna',
  )
})

it('appends an anchor when one is given', () => {
  renderLink({ id: 'realia_000846', lemma: 'Apkallu' }, '#afo-volume-1')

  expect(screen.getByRole('link', { name: 'Apkallu' })).toHaveAttribute(
    'href',
    '/tools/realia/Apkallu#afo-volume-1',
  )
})
