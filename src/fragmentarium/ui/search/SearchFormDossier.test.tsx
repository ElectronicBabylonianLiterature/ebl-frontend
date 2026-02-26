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
      expect(mockSearchSuggestions).toHaveBeenCalledWith('', undefined)
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

  it('renders Form.Group with correct structure', () => {
    render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    const formGroup = screen.getByTestId('dossier-form-group')
    expect(formGroup).toBeInTheDocument()
  })

  it('renders help column for accessibility', () => {
    render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    const helpCol = screen.getByTestId('search-form-help-col')
    expect(helpCol).toBeInTheDocument()
  })

  it('handles null description', async () => {
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

  it('handles undefined description', async () => {
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

  it('respects isClearable prop', () => {
    const { rerender } = render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value="D001"
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
        isClearable={true}
      />,
    )

    expect(screen.getByLabelText('Dossier Search')).toBeInTheDocument()

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

  it('loads options on initial focus with defaultOptions', async () => {
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
      expect(mockSearchSuggestions).toHaveBeenCalledWith('', undefined)
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

  it('handles changing from value to null', () => {
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
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
      />,
    )

    expect(screen.queryByText(/D001/)).not.toBeInTheDocument()
  })

  it('passes filters to searchSuggestions', async () => {
    const filters = {
      genre: 'Incantation',
      provenance: 'Babylon',
      scriptPeriod: 'Neo-Babylonian',
    }
    mockSearchSuggestions.mockResolvedValue([
      new DossierRecordSuggestion(mockSuggestionDto),
    ])

    render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
        filters={filters}
      />,
    )

    await waitFor(() => {
      expect(mockSearchSuggestions).toHaveBeenCalledWith('', filters)
    })
  })

  it('reloads suggestions when filters change', async () => {
    const filters1 = { genre: 'Incantation' }
    const filters2 = { genre: 'Prayer' }
    mockSearchSuggestions.mockResolvedValue([
      new DossierRecordSuggestion(mockSuggestionDto),
    ])

    const { rerender } = render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
        filters={filters1}
      />,
    )

    await waitFor(() => {
      expect(mockSearchSuggestions).toHaveBeenCalledWith('', filters1)
    })

    mockSearchSuggestions.mockClear()

    rerender(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
        filters={filters2}
      />,
    )

    await waitFor(() => {
      expect(mockSearchSuggestions).toHaveBeenCalledWith('', filters2)
    })
  })

  it('passes filters along with search query', async () => {
    const filters = { provenance: 'Nippur' }
    mockSearchSuggestions.mockResolvedValue([
      new DossierRecordSuggestion(mockSuggestionDto),
    ])

    render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
        filters={filters}
      />,
    )

    const input = screen.getByLabelText('Dossier Search')
    await userEvent.type(input, 'D001')

    await waitFor(() => {
      expect(mockSearchSuggestions).toHaveBeenCalledWith('D001', filters)
    })
  })

  it('handles undefined filters', async () => {
    mockSearchSuggestions.mockResolvedValue([
      new DossierRecordSuggestion(mockSuggestionDto),
    ])

    render(
      <SearchFormDossier
        ariaLabel="Dossier Search"
        value={null}
        searchSuggestions={mockSearchSuggestions}
        onChange={mockOnChange}
        filters={undefined}
      />,
    )

    await waitFor(() => {
      expect(mockSearchSuggestions).toHaveBeenCalledWith('', undefined)
    })
  })
})
