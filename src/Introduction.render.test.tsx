import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Introduction from 'Introduction'
import SessionContext from 'auth/SessionContext'
import MemorySession, { guestSession, Session } from 'auth/Session'
import { getServices } from 'test-support/AppDriver'

jest.mock('fragmentarium/ui/front-page/LatestTransliterations', () => ({
  __esModule: true,
  default: () => <div>Latest transliterations</div>,
}))

jest.mock('about/ui/news', () => ({
  newsletters: [
    {
      number: 3,
      date: new Date('2026-02-10'),
      content: [
        '---',
        'title: eBL Newsletter',
        '---',
        '# eBL Newsletter 3',
        '- See the [new search](https://example.com/search) page',
      ].join('\n'),
    },
    { number: 2, date: new Date('2025-02-10'), content: 'Older' },
  ],
}))

function renderIntroduction(session: Session): void {
  const { fragmentService, dossiersService } = getServices()
  render(
    <HelmetProvider>
      <MemoryRouter>
        <SessionContext.Provider value={session}>
          <Introduction
            fragmentService={fragmentService}
            dossiersService={dossiersService}
          />
        </SessionContext.Provider>
      </MemoryRouter>
    </HelmetProvider>,
  )
}

test('shows the latest newsletter preview with links flattened to text', () => {
  renderIntroduction(guestSession)
  expect(screen.getByText('See the new search page')).toBeInTheDocument()
  expect(
    screen.queryByRole('link', { name: 'new search' }),
  ).not.toBeInTheDocument()
  expect(screen.getByText('Newsletter #3')).toBeInTheDocument()
  expect(screen.getByText('Newsletter #2')).toBeInTheDocument()
})

test('hides the latest transliterations without read permission', () => {
  renderIntroduction(new MemorySession([]))
  expect(screen.queryByText('Latest transliterations')).not.toBeInTheDocument()
})

test('shows the latest transliterations to readers of fragments', () => {
  renderIntroduction(new MemorySession(['read:fragments']))
  expect(screen.getByText('Latest transliterations')).toBeInTheDocument()
})
