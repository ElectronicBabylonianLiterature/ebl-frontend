import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import InfoBanner from 'common/InfoBanner'

function renderInfoBanner(
  props: Partial<{
    title: string
    description: string
    learnMorePath: string
  }> = {},
): void {
  render(
    <MemoryRouter>
      <InfoBanner
        title={props.title ?? 'Test Title'}
        description={props.description ?? 'Test description'}
        learnMorePath={props.learnMorePath ?? '/test'}
      />
    </MemoryRouter>,
  )
}

test('renders title', () => {
  renderInfoBanner({ title: 'Signs' })
  expect(screen.getByText('Signs')).toBeInTheDocument()
})

test('renders description', () => {
  renderInfoBanner({ description: 'A comprehensive reference tool.' })
  expect(
    screen.getByText('A comprehensive reference tool.'),
  ).toBeInTheDocument()
})

test('renders learn more link with correct path', () => {
  renderInfoBanner({ learnMorePath: '/about/signs' })
  expect(screen.getByText('Learn more →')).toHaveAttribute(
    'href',
    '/about/signs',
  )
})

test('has region role with title as accessible label', () => {
  renderInfoBanner({ title: 'Dictionary' })
  expect(screen.getByRole('region', { name: 'Dictionary' })).toBeInTheDocument()
})

test('does not use alert role', () => {
  renderInfoBanner()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
