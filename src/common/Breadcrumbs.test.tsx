import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Breadcrumbs, { SectionCrumb, TextCrumb } from './Breadcrumbs'

let element

describe('Three crumbs', () => {
  beforeEach(() => {
    element = render(
      <MemoryRouter>
        <Breadcrumbs
          crumbs={[
            new SectionCrumb('Dictionary'),
            new SectionCrumb('Sub section'),
            new TextCrumb('Text'),
            new SectionCrumb('Active')
          ]}
        />
      </MemoryRouter>
    )
  })

  test('Link on section crumb', () => {
    expect(element.getByText('Dictionary')).toHaveAttribute(
      'href',
      `/dictionary`
    )
  })

  test('No link on sub section crumb', () => {
    expect(element.getByText('Sub section')).toHaveAttribute('href', '#')
  })

  test('No link on text crumb', () => {
    expect(element.getByText('Text')).toHaveAttribute('href', '#')
  })

  test('No link on active crumb', async () => {
    expect(element.getByText('Active')).not.toHaveAttribute('href')
  })

  commonTests()
})

describe('Two crumbs', () => {
  beforeEach(() => {
    element = render(
      <MemoryRouter>
        <Breadcrumbs
          crumbs={[new SectionCrumb('Dictionary'), new SectionCrumb('Active')]}
        />
      </MemoryRouter>
    )
  })

  test('Link on section crumb', () => {
    expect(element.getByText('Dictionary')).toHaveAttribute(
      'href',
      `/dictionary`
    )
  })

  test('No link on active crumb', async () => {
    expect(element.getByText('Active')).not.toHaveAttribute('href')
  })

  commonTests()
})

describe('One crumb', () => {
  beforeEach(() => {
    element = render(
      <MemoryRouter>
        <Breadcrumbs crumbs={[new SectionCrumb('The Section')]} />
      </MemoryRouter>
    )
  })

  test('No link on crumb', async () => {
    expect(element.getByText('The Section')).not.toHaveAttribute('href')
  })

  commonTests()
})

function commonTests(): void {
  test('Links to home', async () => {
    expect(element.getByText('eBL')).toHaveAttribute('href', `/`)
  })
}
