import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Breadcrumbs, { SectionCrumb, TextCrumb } from './Breadcrumbs'

describe('Three crumbs', () => {
  function renderBreadcrumbs(): void {
    render(
      <MemoryRouter>
        <Breadcrumbs
          crumbs={[
            new SectionCrumb('Dictionary'),
            new SectionCrumb('Sub section'),
            new TextCrumb('Text'),
            new SectionCrumb('Active'),
          ]}
        />
      </MemoryRouter>,
    )
  }

  test('Link on section crumb', () => {
    renderBreadcrumbs()
    expect(screen.getByText('Dictionary')).toHaveAttribute(
      'href',
      `/dictionary`,
    )
  })

  test('No link on sub section crumb', () => {
    renderBreadcrumbs()
    expect(screen.getByText('Sub section')).not.toHaveAttribute('href')
  })

  test('No link on text crumb', () => {
    renderBreadcrumbs()
    expect(screen.getByText('Text')).not.toHaveAttribute('href')
  })

  test('No link on active crumb', async () => {
    renderBreadcrumbs()
    expect(screen.getByText('Active')).not.toHaveAttribute('href')
  })

  commonTests(renderBreadcrumbs)
})

describe('Two crumbs', () => {
  function renderBreadcrumbs(): void {
    render(
      <MemoryRouter>
        <Breadcrumbs
          crumbs={[new SectionCrumb('Dictionary'), new SectionCrumb('Active')]}
        />
      </MemoryRouter>,
    )
  }

  test('Link on section crumb', () => {
    renderBreadcrumbs()
    expect(screen.getByText('Dictionary')).toHaveAttribute(
      'href',
      `/dictionary`,
    )
  })

  test('No link on active crumb', async () => {
    renderBreadcrumbs()
    expect(screen.getByText('Active')).not.toHaveAttribute('href')
  })

  commonTests(renderBreadcrumbs)
})

describe('One crumb', () => {
  function renderBreadcrumbs(): void {
    render(
      <MemoryRouter>
        <Breadcrumbs crumbs={[new SectionCrumb('The Section')]} />
      </MemoryRouter>,
    )
  }

  test('No link on crumb', async () => {
    renderBreadcrumbs()
    expect(screen.getByText('The Section')).not.toHaveAttribute('href')
  })

  commonTests(renderBreadcrumbs)
})

describe('Component crumb', () => {
  function renderBreadcrumbs(): void {
    render(
      <MemoryRouter>
        <Breadcrumbs
          crumbs={[new TextCrumb(<span aria-label="React Crumb">React</span>)]}
        />
      </MemoryRouter>,
    )
  }

  test('No link on crumb', async () => {
    renderBreadcrumbs()
    expect(screen.getByText('React')).toHaveAttribute(
      'aria-label',
      'React Crumb',
    )
  })

  commonTests(renderBreadcrumbs)
})

function commonTests(renderBreadcrumbs: () => void): void {
  test('Links to home', async () => {
    renderBreadcrumbs()
    expect(screen.getByText('eBL')).toHaveAttribute('href', `/`)
  })
}
