import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ResearchProjectsOverview from 'research-projects/ResearchProjectsOverview'

jest.mock('common/ui/AppContent', () => ({
  __esModule: true,
  default: ({
    children,
    title,
  }: {
    children: React.ReactNode
    title: string
  }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

test('renders page title', () => {
  render(
    <MemoryRouter>
      <ResearchProjectsOverview />
    </MemoryRouter>,
  )
  expect(
    screen.getByRole('heading', { name: 'Research Projects' }),
  ).toBeInTheDocument()
})

test('renders all project cards', () => {
  render(
    <MemoryRouter>
      <ResearchProjectsOverview />
    </MemoryRouter>,
  )
  expect(screen.getByText('CAIC')).toBeInTheDocument()
  expect(screen.getByText('aluGeneva')).toBeInTheDocument()
  expect(screen.getByText('AMPS')).toBeInTheDocument()
  expect(screen.getByText('RECC')).toBeInTheDocument()
})

test('renders project names', () => {
  render(
    <MemoryRouter>
      <ResearchProjectsOverview />
    </MemoryRouter>,
  )
  expect(
    screen.getByText('Cuneiform Artefacts of Iraq in Context'),
  ).toBeInTheDocument()
  expect(
    screen.getByText('Edition of the Omen Series Šumma ālu'),
  ).toBeInTheDocument()
})

test('renders project links', () => {
  render(
    <MemoryRouter>
      <ResearchProjectsOverview />
    </MemoryRouter>,
  )
  const links = screen.getAllByRole('link')
  const projectLinks = links.filter((link) =>
    link.getAttribute('href')?.startsWith('/projects/'),
  )
  expect(projectLinks).toHaveLength(4)
})

test('renders learn more text for each project', () => {
  render(
    <MemoryRouter>
      <ResearchProjectsOverview />
    </MemoryRouter>,
  )
  expect(screen.getAllByText('Learn more')).toHaveLength(4)
})
