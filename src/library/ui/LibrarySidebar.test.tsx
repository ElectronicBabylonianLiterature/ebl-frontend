import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LibrarySidebar from 'library/ui/LibrarySidebar'

describe('LibrarySidebar', () => {
  it('renders all reference library sections', () => {
    render(
      <MemoryRouter>
        <LibrarySidebar activeSection="signs" />
      </MemoryRouter>,
    )

    expect(screen.getByText('Signs')).toBeInTheDocument()
    expect(screen.getByText('Dictionary')).toBeInTheDocument()
    expect(screen.getByText('Bibliography')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /Signs/i })).toHaveAttribute(
      'href',
      '/reference-library/signs',
    )
    expect(screen.getByRole('link', { name: /Dictionary/i })).toHaveAttribute(
      'href',
      '/reference-library/dictionary',
    )
    expect(screen.getByRole('link', { name: /Bibliography/i })).toHaveAttribute(
      'href',
      '/reference-library/bibliography',
    )
  })

  it('marks only the active section', () => {
    render(
      <MemoryRouter>
        <LibrarySidebar activeSection="dictionary" />
      </MemoryRouter>,
    )

    const dictionaryLink = screen.getByRole('link', { name: /Dictionary/i })
    const signsLink = screen.getByRole('link', { name: /Signs/i })

    expect(dictionaryLink).toHaveClass('active')
    expect(signsLink).not.toHaveClass('active')
  })
})
