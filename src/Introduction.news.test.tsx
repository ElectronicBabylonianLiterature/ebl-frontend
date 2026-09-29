import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Introduction from 'Introduction'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dossiers/application/DossiersService')

jest.mock('about/ui/news', () => ({
  newsletters: [4, 3, 2, 1].map((number) => ({
    number,
    date: new Date(2024, 0, number),
    content: [
      '---',
      `title: eBL Newsletter ${number}`,
      '---',
      '',
      `- Read the [release notes ${number}](https://example.com/${number})`,
    ].join('\n'),
  })),
}))

const FragmentServiceMock = FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>
const DossiersServiceMock = DossiersService as jest.Mock<
  jest.Mocked<DossiersService>
>

function renderIntroduction(
  scopes: readonly string[],
  fragmentService: jest.Mocked<FragmentService> = new FragmentServiceMock(),
): void {
  render(
    <HelmetProvider>
      <MemoryRouter>
        <SessionContext.Provider value={new MemorySession(scopes)}>
          <Introduction
            fragmentService={fragmentService}
            dossiersService={new DossiersServiceMock()}
          />
        </SessionContext.Provider>
      </MemoryRouter>
    </HelmetProvider>,
  )
}

test('renders links in the latest newsletter preview as plain text', () => {
  renderIntroduction([])

  expect(
    screen.getByText('Read the release notes 4', { selector: 'li' }),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('link', { name: 'release notes 4' }),
  ).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Newsletter #4/ })).toHaveAttribute(
    'href',
    '/about/news/4',
  )
  expect(screen.queryByText('Latest Additions')).not.toBeInTheDocument()
})

test('shows the latest transliterations to readers of fragments', async () => {
  const fragmentService = new FragmentServiceMock()
  fragmentService.queryLatest.mockResolvedValue({
    items: [],
    matchCountTotal: 0,
  })

  renderIntroduction(['read:fragments'], fragmentService)

  expect(await screen.findByText('Latest Additions')).toBeInTheDocument()
})
