import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AppContent from './AppContent'
import { SectionCrumb } from './Breadcrumbs'

function breadCrumbs() {
  return within(screen.getByRole('navigation', { name: 'breadcrumb' }))
}

test('Title', () => {
  render(
    <MemoryRouter>
      <AppContent
        crumbs={[new SectionCrumb('Dictionary'), new SectionCrumb('Active')]}
        title="Title"
      />
    </MemoryRouter>,
  )
  expect(breadCrumbs().getByText('eBL')).toBeVisible()
  expect(breadCrumbs().getByText('Dictionary')).toBeVisible()
  expect(breadCrumbs().getByText('Active')).toBeVisible()

  expect(screen.getByRole('heading', { name: 'Title' })).toBeVisible()
})

test('Section and active', () => {
  render(
    <MemoryRouter>
      <AppContent
        crumbs={[new SectionCrumb('Dictionary'), new SectionCrumb('Active')]}
      />
    </MemoryRouter>,
  )
  expect(breadCrumbs().getByText('eBL')).toBeVisible()
  expect(breadCrumbs().getByText('Dictionary')).toBeVisible()
  expect(breadCrumbs().getByText('Active')).toBeVisible()

  expect(screen.getByRole('heading', { name: 'Active' })).toBeVisible()
})

test('Section', () => {
  render(
    <MemoryRouter>
      <AppContent crumbs={[new SectionCrumb('The Section')]} />
    </MemoryRouter>,
  )

  expect(breadCrumbs().getByText('eBL')).toBeVisible()
  expect(breadCrumbs().getByText('The Section')).toBeVisible()

  expect(screen.getByRole('heading', { name: 'The Section' })).toBeVisible()
})

test('No props', () => {
  render(
    <MemoryRouter>
      <AppContent />
    </MemoryRouter>,
  )
  expect(screen.getByText('eBL')).toBeVisible()
})

test('Children', () => {
  render(
    <MemoryRouter>
      <AppContent>Children</AppContent>
    </MemoryRouter>,
  )
  expect(screen.getByText('Children')).toBeVisible()
})

test('Sidebar', () => {
  render(
    <MemoryRouter>
      <AppContent sidebar="Sidebar">Children</AppContent>
    </MemoryRouter>,
  )
  expect(screen.getByText('Sidebar')).toBeVisible()
})
