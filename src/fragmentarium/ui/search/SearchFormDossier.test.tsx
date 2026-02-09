import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import selectEvent from 'react-select-event'
import SearchFormDossier from './SearchFormDossier'
import { DossierRecordSuggestion } from 'dossiers/domain/DossierRecord'

const mockSuggestionDto = {
  id: 'D001',
  description: 'Test dossier description',
}

describe('SearchFormDossier', () => {
  const mockSearchSuggestions = jest.fn()
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockSearchSuggestions.mockClear()
    mockSearchSuggestions.mockResolvedValue([])
    mockOnChange.mockClear()
  })

  it('renders AsyncSelect with correct placeholder', () => {
    render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    expect(screen.getByLabelText('Dossier Search')).toBeInTheDocument()
    expect(screen.getByText('Dossiers')).toBeInTheDocument()
  })

  it('displays selected dossier value', () => {
    render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value="D001"
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    expect(screen.getByText(/D001/)).toBeInTheDocument()
  })

  it('calls searchSuggestions when user types', async () => {
    mockSearchSuggestions.mockResolvedValue([
      new DossierRecordSuggestion(mockSuggestionDto),
    ])

    render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    const input = screen.getByLabelText('Dossier Search')

    await userEvent.type(input, 'D001')

    await waitFor(() => {
      expect(mockSearchSuggestions).toHaveBeenCalled()
    })
  })

  it('displays search results in dropdown', async () => {
    const suggestions = [
      new DossierRecordSuggestion(mockSuggestionDto),
      new DossierRecordSuggestion({
        id: 'D002',
        description: 'Second dossier',
      }),
    ]
    mockSearchSuggestions.mockResolvedValue(suggestions)

    render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    const input = screen.getByLabelText('Dossier Search')

    await userEvent.type(input, 'D')

    await waitFor(() => {
      expect(
        screen.getByText(/D001 — Test dossier description/),
      ).toBeInTheDocument()
    })
    expect(screen.getByText(/D002 — Second dossier/)).toBeInTheDocument()
  })

  it('calls onChange with dossierId when option selected', async () => {
    const suggestion = new DossierRecordSuggestion(mockSuggestionDto)
    mockSearchSuggestions.mockResolvedValue([suggestion])

    render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    const input = screen.getByLabelText('Dossier Search')

    await userEvent.type(input, 'D001')

    await waitFor(() => {
      expect(
        screen.getByText(/D001 — Test dossier description/),
      ).toBeInTheDocument()
    })

    const option = screen.getByText(/D001 — Test dossier description/)
    await userEvent.click(option)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('D001')
    })
  })

  it('calls onChange with null when cleared', async () => {
    render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value="D001"
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
        isClearable={true}
      />,
    )

    // Wait for component to be fully rendered
    await waitFor(() => {
      expect(screen.getByText(/D001/)).toBeInTheDocument()
    })

    await selectEvent.clearFirst(screen.getByLabelText('Dossier Search'))

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(null)
    })
  })

  it('handles empty search input', async () => {
    mockSearchSuggestions.mockResolvedValue([])

    render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    await waitFor(() => {
      expect(mockSearchSuggestions).toHaveBeenCalledWith('')
    })
  })

  it('sorts suggestions by label', async () => {
    const suggestions = [
      new DossierRecordSuggestion({ id: 'D003', description: 'Third' }),
      new DossierRecordSuggestion({ id: 'D001', description: 'First' }),
      new DossierRecordSuggestion({ id: 'D002', description: 'Second' }),
    ]
    mockSearchSuggestions.mockResolvedValue(suggestions)

    render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    const input = screen.getByLabelText('Dossier Search')
    await userEvent.type(input, 'D')

    await waitFor(() => {
      const options = screen.getAllByText(/D00/)
      expect(options[0]).toHaveTextContent(/D001/)
    })
  })

  it('handles API errors gracefully', async () => {
    mockSearchSuggestions.mockRejectedValue(new Error('API Error'))

    render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    const input = screen.getByLabelText('Dossier Search')
    await userEvent.type(input, 'D001')

    await waitFor(() => {
      expect(mockSearchSuggestions).toHaveBeenCalled()
    })
  })

  it('syncs with external value prop changes', () => {
    const { rerender } = render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value="D001"
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    expect(screen.getByText(/D001/)).toBeInTheDocument()

    rerender(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value="D002"
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    expect(screen.getByText(/D002/)).toBeInTheDocument()
  })
})
