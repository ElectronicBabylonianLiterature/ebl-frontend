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

describe('SearchFormDossier selection', () => {
  const { mockSearchSuggestions, mockOnChange } = setupDossierMocks()

  it('handles empty string description', async () => {
    const suggestions = [
      new DossierRecordSuggestion({ id: 'D001', description: '' }),
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
    await userEvent.type(input, 'D001')

    await waitFor(() => {
      expect(screen.getByRole('option')).toHaveTextContent(/D001/)
    })
  })

  it('respects isClearable prop', async () => {
    const { rerender } = render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value="D001"
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
        isClearable={true}
      />,
    )

    expect(await screen.findByLabelText('Dossier Search')).toBeInTheDocument()

    rerender(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value="D001"
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
        isClearable={false}
      />,
    )

    expect(screen.getByLabelText('Dossier Search')).toBeInTheDocument()
  })

  it('handles selecting, clearing, and selecting again', async () => {
    const suggestion = new DossierRecordSuggestion(mockSuggestionDto)
    mockSearchSuggestions.mockResolvedValue([suggestion])

    const { rerender } = render(
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

    rerender(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value="D001"
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    await selectEvent.clearFirst(screen.getByLabelText('Dossier Search'))

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(null)
    })

    rerender(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

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

  it('sorts numeric IDs correctly', async () => {
    const suggestions = [
      new DossierRecordSuggestion({ id: 'D10', description: 'Ten' }),
      new DossierRecordSuggestion({ id: 'D1', description: 'One' }),
      new DossierRecordSuggestion({ id: 'D2', description: 'Two' }),
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
      expect(screen.getAllByText(/D\d/)).toHaveLength(3)
    })

    const options = screen.getAllByText(/D\d/)
    expect(options[0]).toHaveTextContent(/D1 — One/)
    expect(options[1]).toHaveTextContent(/D2 — Two/)
    expect(options[2]).toHaveTextContent(/D10 — Ten/)
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

    await userEvent.keyboard('{Escape}')

    await waitFor(() => {
      expect(
        screen.queryByText(/D001 — Test dossier description/),
      ).not.toBeInTheDocument()
    })
  })
})
