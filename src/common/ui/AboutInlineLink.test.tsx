import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AboutInlineLink from 'common/ui/AboutInlineLink'

function linkWithClass(className?: string): HTMLElement {
  render(
    <MemoryRouter>
      <AboutInlineLink
        to="/about/corpus"
        label="the Corpus"
        className={className}
      />
    </MemoryRouter>,
  )
  return screen.getByRole('link', { name: 'Learn more about the Corpus' })
}

test('links to the about page with an accessible label', () => {
  const link = linkWithClass()
  expect(link).toHaveAttribute('href', '/about/corpus')
  expect(link).toHaveAttribute('title', 'Learn more about the Corpus')
  expect(link).toHaveAttribute('class', 'AboutInlineLink')
})

test('appends an extra class name', () => {
  expect(linkWithClass('ms-2')).toHaveAttribute('class', 'AboutInlineLink ms-2')
})
