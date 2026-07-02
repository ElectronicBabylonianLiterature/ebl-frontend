import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RealiaSearchForm from 'realia/ui/RealiaSearchForm'

const mockNavigate = jest.fn()

const routerFuture = Object.fromEntries([
  ['v7_startTransition', true],
  ['v7_relativeSplatPath', true],
])

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

function renderForm(query = ''): void {
  render(
    <MemoryRouter future={routerFuture}>
      <RealiaSearchForm query={query} />
    </MemoryRouter>,
  )
}

describe('RealiaSearchForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with initial query value in the input', () => {
    renderForm('pig')
    expect(screen.getByDisplayValue('pig')).toBeInTheDocument()
  })

  it('renders a visible label for the search input', () => {
    renderForm()
    expect(screen.getByLabelText('Search realia')).toBeInTheDocument()
  })

  it('renders placeholder when query is empty', () => {
    renderForm()
    expect(screen.getByPlaceholderText('Enter a term…')).toBeInTheDocument()
  })

  it('updates input value on change', () => {
    renderForm()
    fireEvent.change(screen.getByPlaceholderText('Enter a term…'), {
      target: { value: 'new value' },
    })
    expect(screen.getByDisplayValue('new value')).toBeInTheDocument()
  })

  it('navigates to search results on submit', () => {
    renderForm()
    fireEvent.change(screen.getByPlaceholderText('Enter a term…'), {
      target: { value: 'pig' },
    })
    fireEvent.click(screen.getByRole('button', { name: /search/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/tools/realia?query=pig')
  })

  it('encodes special characters in query on submit', () => {
    renderForm()
    fireEvent.change(screen.getByPlaceholderText('Enter a term…'), {
      target: { value: 'pig & boar' },
    })
    fireEvent.click(screen.getByRole('button', { name: /search/i }))
    expect(mockNavigate).toHaveBeenCalledWith(
      '/tools/realia?query=pig%20%26%20boar',
    )
  })
})
