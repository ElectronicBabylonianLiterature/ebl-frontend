import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import SearchFormDossier from 'fragmentarium/ui/search/SearchFormDossier'
import { DossierRecordSuggestion } from 'dossiers/domain/DossierRecord'
import {
  mockSuggestionDto,
  setupDossierMocks,
} from 'fragmentarium/ui/search/SearchFormDossier.testSupport'

describe('SearchFormDossier edge cases', () => {
  const { mockSearchSuggestions, mockOnChange } = setupDossierMocks()

  it('does not load options until user enters a query', async () => {
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

    await waitFor(() => {
      expect(mockSearchSuggestions).not.toHaveBeenCalled()
    })
  })

  it('handles very long descriptions', async () => {
    const longDescription = 'A'.repeat(200)
    const suggestions = [
      new DossierRecordSuggestion({ id: 'D001', description: longDescription }),
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
        screen.getByText(new RegExp(`D001 — ${longDescription}`)),
      ).toBeInTheDocument()
    })
  })

  it('filters out null entries from suggestions', async () => {
    mockSearchSuggestions.mockResolvedValue([
      new DossierRecordSuggestion(mockSuggestionDto),
      null,
      new DossierRecordSuggestion({ id: 'D002', description: 'Second' }),
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
    await userEvent.type(input, 'D')

    await waitFor(() => {
      expect(
        screen.getByText(/D001 — Test dossier description/),
      ).toBeInTheDocument()
    })
    expect(screen.getByText(/D002 — Second/)).toBeInTheDocument()
  })

  it('handles rapid value changes', async () => {
    const { rerender } = render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value="D001"
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    expect(await screen.findByText(/D001/)).toBeInTheDocument()

    rerender(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value="D002"
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    expect(screen.getByText(/D002/)).toBeInTheDocument()

    rerender(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value="D003"
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    expect(screen.getByText(/D003/)).toBeInTheDocument()
  })

  it('handles changing from value to null', async () => {
    const { rerender } = render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value="D001"
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    expect(await screen.findByText(/D001/)).toBeInTheDocument()

    rerender(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    expect(screen.queryByText(/D001/)).not.toBeInTheDocument()
  })
})
