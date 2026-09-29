import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import selectEvent from 'react-select-event'
import SearchFormDossier from 'fragmentarium/ui/search/SearchFormDossier'
import { DossierRecordSuggestion } from 'dossiers/domain/DossierRecord'
import {
  dossierSearchProps,
  mockOnChange,
  mockSearchSuggestions,
  mockSuggestionDto,
  resetDossierSearchMocks,
} from 'fragmentarium/ui/search/SearchFormDossier.testSupport'

describe('SearchFormDossier selection', () => {
  beforeEach(resetDossierSearchMocks)

  it('calls onChange with dossierId when option selected', async () => {
    const suggestion = new DossierRecordSuggestion(mockSuggestionDto)
    mockSearchSuggestions.mockResolvedValue([suggestion])

    render(<SearchFormDossier {...dossierSearchProps} value={null} />)

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
        {...dossierSearchProps}
        value="D001"
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

  it('handles selecting, clearing, and selecting again', async () => {
    const suggestion = new DossierRecordSuggestion(mockSuggestionDto)
    mockSearchSuggestions.mockResolvedValue([suggestion])

    const { rerender } = render(
      <SearchFormDossier {...dossierSearchProps} value={null} />,
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

    rerender(<SearchFormDossier {...dossierSearchProps} value="D001" />)

    await selectEvent.clearFirst(screen.getByLabelText('Dossier Search'))

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(null)
    })

    rerender(<SearchFormDossier {...dossierSearchProps} value={null} />)

    const suggestion2 = new DossierRecordSuggestion({
      id: 'D002',
      description: 'Different dossier',
    })
    mockSearchSuggestions.mockResolvedValue([suggestion2])

    await userEvent.type(screen.getByLabelText('Dossier Search'), 'D002')

    await waitFor(() => {
      expect(screen.getByText(/D002 — Different dossier/)).toBeInTheDocument()
    })

    const option2 = screen.getByText(/D002 — Different dossier/)
    await userEvent.click(option2)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('D002')
    })
  })

  it('handles keyboard navigation with arrow keys', async () => {
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

    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  it('handles escape key to close dropdown', async () => {
    mockSearchSuggestions.mockResolvedValue([
      new DossierRecordSuggestion(mockSuggestionDto),
    ])

    render(<SearchFormDossier {...dossierSearchProps} value={null} />)

    const input = screen.getByLabelText('Dossier Search')
    await userEvent.type(input, 'D')

    await waitFor(() => {
      expect(
        screen.getByText(/D001 — Test dossier description/),
      ).toBeInTheDocument()
    })

    await userEvent.keyboard('{Escape}')

    await waitFor(() => {
      expect(
        screen.queryByText(/D001 — Test dossier description/),
      ).not.toBeInTheDocument()
    })
  })
})
