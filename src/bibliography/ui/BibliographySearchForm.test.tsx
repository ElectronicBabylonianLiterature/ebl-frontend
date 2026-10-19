import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import BibliographySearchForm from 'bibliography/ui/BibliographySearchForm'
import LocationDisplay from 'test-support/LocationDisplay'

function renderForm(query: string | null | undefined): void {
  render(
    <MemoryRouter initialEntries={['/tools/references']}>
      <BibliographySearchForm query={query} />
      <LocationDisplay />
    </MemoryRouter>,
  )
}

describe('BibliographySearchForm', () => {
  it('shows the initial query', () => {
    renderForm('Borger')
    expect(screen.getByLabelText('Bibliography-Query')).toHaveValue('Borger')
  })

  it('starts empty without a query', () => {
    renderForm(null)
    expect(screen.getByLabelText('Bibliography-Query')).toHaveValue('')
  })

  it('navigates to the typed query on submit', async () => {
    renderForm(undefined)
    await userEvent.type(
      screen.getByLabelText('Bibliography-Query'),
      'Borger 1957',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/tools/references?query=Borger%201957',
    )
  })
})
