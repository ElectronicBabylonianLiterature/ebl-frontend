import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Breadcrumbs, { SectionCrumb, TextCrumb } from './Breadcrumbs'

describe('Three crumbs', () => {
  beforeEach(() => {
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
      </MemoryRouter>
    )
  })

  test('Link on section crumb', () => {
    expect(screen.getByText('Dictionary')).toHaveAttribute(
      'href',
      `/dictionary`
    )
  })

  test('No link on sub section crumb', () => {
    expect(screen.getByText('Sub section')).toHaveAttribute('href', '#')
  })

  test('No link on text crumb', () => {
    expect(screen.getByText('Text')).toHaveAttribute('href', '#')
  })

  test('No link on active crumb', async () => {
    expect(screen.getByText('Active')).not.toHaveAttribute('href')
  })

  commonTests()
})

describe('Two crumbs', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <Breadcrumbs
          crumbs={[new SectionCrumb('Dictionary'), new SectionCrumb('Active')]}
        />
      </MemoryRouter>
    )
  })

  test('Link on section crumb', () => {
    expect(screen.getByText('Dictionary')).toHaveAttribute(
      'href',
      `/dictionary`
    )
  })

  test('No link on active crumb', async () => {
    expect(screen.getByText('Active')).not.toHaveAttribute('href')
  })

  commonTests()
})

describe('One crumb', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <Breadcrumbs crumbs={[new SectionCrumb('The Section')]} />
      </MemoryRouter>
    )
  })

  test('No link on crumb', async () => {
    expect(screen.getByText('The Section')).not.toHaveAttribute('href')
  })

  commonTests()
})

describe('Component crumb', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <Breadcrumbs
          crumbs={[new TextCrumb(<span aria-label="React Crumb">React</span>)]}
        />
      </MemoryRouter>
    )
  })

  test('No link on crumb', async () => {
    expect(screen.getByText('React')).toHaveAttribute(
      'aria-label',
      'React Crumb'
    )
  })

  commonTests()
})

function commonTests(): void {
  test('Links to home', async () => {
    expect(screen.getByText('eBL')).toHaveAttribute('href', `/`)
  })
}
