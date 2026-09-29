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

describe('SearchFormDossier filters', () => {
  beforeEach(resetDossierSearchMocks)

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
        {...dossierSearchProps}
        value={null}
        filters={filters}
      />,
    )

    const input = screen.getByLabelText('Dossier Search')
    await userEvent.type(input, 'D001')

    await waitFor(() => {
      expect(mockSearchSuggestions).toHaveBeenCalledWith('D001', filters)
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
        {...dossierSearchProps}
        value={null}
        filters={filters1}
      />,
    )

    const input = screen.getByLabelText('Dossier Search')
    await userEvent.type(input, 'D001')

    await waitFor(() => {
      expect(mockSearchSuggestions).toHaveBeenCalledWith('D001', filters1)
    })

    mockSearchSuggestions.mockClear()

    rerender(
      <SearchFormDossier
        {...dossierSearchProps}
        value={null}
        filters={filters2}
      />,
    )

    await userEvent.type(screen.getByLabelText('Dossier Search'), 'D002')

    await waitFor(() => {
      expect(mockSearchSuggestions).toHaveBeenCalledWith('D002', filters2)
    })
  })

  it('passes filters along with search query', async () => {
    const filters = { provenance: 'Nippur' }
    mockSearchSuggestions.mockResolvedValue([
      new DossierRecordSuggestion(mockSuggestionDto),
    ])

    render(
      <SearchFormDossier
        {...dossierSearchProps}
        value={null}
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
        {...dossierSearchProps}
        value={null}
        filters={undefined}
      />,
    )

    const input = screen.getByLabelText('Dossier Search')
    await userEvent.type(input, 'D001')

    await waitFor(() => {
      expect(mockSearchSuggestions).toHaveBeenCalledWith('D001', undefined)
    })
  })
})
