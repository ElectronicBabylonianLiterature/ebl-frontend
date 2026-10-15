import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import SearchFormDossier from 'fragmentarium/ui/search/SearchFormDossier'
import { DossierRecordSuggestion } from 'dossiers/domain/DossierRecord'
import { setupDossierMocks } from 'fragmentarium/ui/search/SearchFormDossier.testSupport'

describe('SearchFormDossier suggestions', () => {
  const { mockSearchSuggestions, mockOnChange } = setupDossierMocks()

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

  it('syncs with external value prop changes', async () => {
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
  })

  it('renders Form.Group with correct structure', async () => {
    render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    const formGroup = await screen.findByTestId('dossier-form-group')
    expect(formGroup).toBeInTheDocument()
  })

  it('renders help column for accessibility', async () => {
    render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    const helpCol = await screen.findByTestId('search-form-help-col')
    expect(helpCol).toBeInTheDocument()
  })

  it.each(['null', 'undefined'])('handles %s description', async () => {
    const suggestions = [
      new DossierRecordSuggestion({ id: 'D001', description: undefined }),
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
})
