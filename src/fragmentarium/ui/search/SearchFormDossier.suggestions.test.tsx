import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import SearchFormDossier from 'fragmentarium/ui/search/SearchFormDossier'
import { DossierRecordSuggestion } from 'dossiers/domain/DossierRecord'
import {
  dossierSearchProps,
  mockSearchSuggestions,
  mockSuggestionDto,
  resetDossierSearchMocks,
} from 'fragmentarium/ui/search/SearchFormDossier.testSupport'

describe('SearchFormDossier suggestions', () => {
  beforeEach(resetDossierSearchMocks)

  it('calls searchSuggestions when user types', async () => {
    mockSearchSuggestions.mockResolvedValue([
      new DossierRecordSuggestion(mockSuggestionDto),
    ])

    render(<SearchFormDossier {...dossierSearchProps} value={null} />)

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

    render(<SearchFormDossier {...dossierSearchProps} value={null} />)

    const input = screen.getByLabelText('Dossier Search')

    await userEvent.type(input, 'D')

    await waitFor(() => {
      expect(
        screen.getByText(/D001 — Test dossier description/),
      ).toBeInTheDocument()
    })
    expect(screen.getByText(/D002 — Second dossier/)).toBeInTheDocument()
  })

  it('handles empty search input', async () => {
    mockSearchSuggestions.mockResolvedValue([])

    render(<SearchFormDossier {...dossierSearchProps} value={null} />)

    await waitFor(() => {
      expect(mockSearchSuggestions).not.toHaveBeenCalled()
    })
  })

  it('sorts suggestions by label', async () => {
    const suggestions = [
      new DossierRecordSuggestion({ id: 'D003', description: 'Third' }),
      new DossierRecordSuggestion({ id: 'D001', description: 'First' }),
      new DossierRecordSuggestion({ id: 'D002', description: 'Second' }),
    ]
    mockSearchSuggestions.mockResolvedValue(suggestions)

    render(<SearchFormDossier {...dossierSearchProps} value={null} />)

    const input = screen.getByLabelText('Dossier Search')
    await userEvent.type(input, 'D')

    await waitFor(() => {
      const options = screen.getAllByText(/D00/)
      expect(options[0]).toHaveTextContent(/D001/)
    })
  })

  it('handles API errors gracefully', async () => {
    mockSearchSuggestions.mockRejectedValue(new Error('API Error'))

    render(<SearchFormDossier {...dossierSearchProps} value={null} />)

    const input = screen.getByLabelText('Dossier Search')
    await userEvent.type(input, 'D001')

    await waitFor(() => {
      expect(mockSearchSuggestions).toHaveBeenCalled()
    })
  })

  it('handles null description', async () => {
    const suggestions = [
      new DossierRecordSuggestion({ id: 'D001', description: undefined }),
    ]
    mockSearchSuggestions.mockResolvedValue(suggestions)

    render(<SearchFormDossier {...dossierSearchProps} value={null} />)

    const input = screen.getByLabelText('Dossier Search')
    await userEvent.type(input, 'D001')

    await waitFor(() => {
      expect(screen.getByRole('option')).toHaveTextContent(/D001/)
    })
  })

  it('handles undefined description', async () => {
    const suggestions = [
      new DossierRecordSuggestion({ id: 'D001', description: undefined }),
    ]
    mockSearchSuggestions.mockResolvedValue(suggestions)

    render(<SearchFormDossier {...dossierSearchProps} value={null} />)

    const input = screen.getByLabelText('Dossier Search')
    await userEvent.type(input, 'D001')

    await waitFor(() => {
      expect(screen.getByRole('option')).toHaveTextContent(/D001/)
    })
  })

  it('handles empty string description', async () => {
    const suggestions = [
      new DossierRecordSuggestion({ id: 'D001', description: '' }),
    ]
    mockSearchSuggestions.mockResolvedValue(suggestions)

    render(<SearchFormDossier {...dossierSearchProps} value={null} />)

    const input = screen.getByLabelText('Dossier Search')
    await userEvent.type(input, 'D001')

    await waitFor(() => {
      expect(screen.getByRole('option')).toHaveTextContent(/D001/)
    })
  })

  it('sorts numeric IDs correctly', async () => {
    const suggestions = [
      new DossierRecordSuggestion({ id: 'D10', description: 'Ten' }),
      new DossierRecordSuggestion({ id: 'D1', description: 'One' }),
      new DossierRecordSuggestion({ id: 'D2', description: 'Two' }),
    ]
    mockSearchSuggestions.mockResolvedValue(suggestions)

    render(<SearchFormDossier {...dossierSearchProps} value={null} />)

    const input = screen.getByLabelText('Dossier Search')
    await userEvent.type(input, 'D')

    await waitFor(() => {
      expect(screen.getAllByText(/D\d/)).toHaveLength(3)
    })

    const options = screen.getAllByText(/D\d/)
    expect(options[0]).toHaveTextContent(/D1 — One/)
    expect(options[1]).toHaveTextContent(/D2 — Two/)
    expect(options[2]).toHaveTextContent(/D10 — Ten/)
  })

  it('does not load options until user enters a query', async () => {
    mockSearchSuggestions.mockResolvedValue([
      new DossierRecordSuggestion(mockSuggestionDto),
    ])

    render(<SearchFormDossier {...dossierSearchProps} value={null} />)

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

    render(<SearchFormDossier {...dossierSearchProps} value={null} />)

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

    render(<SearchFormDossier {...dossierSearchProps} value={null} />)

    const input = screen.getByLabelText('Dossier Search')
    await userEvent.type(input, 'D')

    await waitFor(() => {
      expect(
        screen.getByText(/D001 — Test dossier description/),
      ).toBeInTheDocument()
    })
    expect(screen.getByText(/D002 — Second/)).toBeInTheDocument()
  })
})
