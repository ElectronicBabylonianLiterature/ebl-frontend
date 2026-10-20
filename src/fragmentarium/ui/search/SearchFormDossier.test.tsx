import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import selectEvent from 'react-select-event'
import SearchFormDossier from 'fragmentarium/ui/search/SearchFormDossier'
import { DossierRecordSuggestion } from 'dossiers/domain/DossierRecord'
import {
  mockSuggestionDto,
  setupDossierMocks,
} from 'fragmentarium/ui/search/SearchFormDossier.testSupport'

describe('SearchFormDossier', () => {
  const { mockSearchSuggestions, mockOnChange } = setupDossierMocks()

  it('renders AsyncSelect with correct placeholder', async () => {
    render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    expect(await screen.findByLabelText('Dossier Search')).toBeInTheDocument()
    expect(screen.getByText('Dossiers')).toBeInTheDocument()
  })

  it('displays selected dossier value', async () => {
    render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value="D001"
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    expect(await screen.findByText(/D001/)).toBeInTheDocument()
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
      expect(mockSearchSuggestions).not.toHaveBeenCalled()
    })
  })
})
