import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SearchFormDossier from 'fragmentarium/ui/search/SearchFormDossier'
import {
  dossierSearchProps,
  resetDossierSearchMocks,
} from 'fragmentarium/ui/search/SearchFormDossier.testSupport'

describe('SearchFormDossier', () => {
  beforeEach(resetDossierSearchMocks)

  it('renders AsyncSelect with correct placeholder', async () => {
    render(<SearchFormDossier {...dossierSearchProps} value={null} />)

    expect(await screen.findByLabelText('Dossier Search')).toBeInTheDocument()
    expect(screen.getByText('Dossiers')).toBeInTheDocument()
  })

  it('displays selected dossier value', async () => {
    render(<SearchFormDossier {...dossierSearchProps} value="D001" />)

    expect(await screen.findByText(/D001/)).toBeInTheDocument()
  })

  it('syncs with external value prop changes', async () => {
    const { rerender } = render(
      <SearchFormDossier {...dossierSearchProps} value="D001" />,
    )

    expect(await screen.findByText(/D001/)).toBeInTheDocument()

    rerender(<SearchFormDossier {...dossierSearchProps} value="D002" />)

    expect(screen.getByText(/D002/)).toBeInTheDocument()
  })

  it('renders Form.Group with correct structure', async () => {
    render(<SearchFormDossier {...dossierSearchProps} value={null} />)

    const formGroup = await screen.findByTestId('dossier-form-group')
    expect(formGroup).toBeInTheDocument()
  })

  it('renders help column for accessibility', async () => {
    render(<SearchFormDossier {...dossierSearchProps} value={null} />)

    const helpCol = await screen.findByTestId('search-form-help-col')
    expect(helpCol).toBeInTheDocument()
  })

  it('respects isClearable prop', async () => {
    const { rerender } = render(
      <SearchFormDossier
        {...dossierSearchProps}
        value="D001"
        isClearable={true}
      />,
    )

    expect(await screen.findByLabelText('Dossier Search')).toBeInTheDocument()

    rerender(
      <SearchFormDossier
        {...dossierSearchProps}
        value="D001"
        isClearable={false}
      />,
    )

    expect(screen.getByLabelText('Dossier Search')).toBeInTheDocument()
  })

  it('handles rapid value changes', async () => {
    const { rerender } = render(
      <SearchFormDossier {...dossierSearchProps} value="D001" />,
    )

    expect(await screen.findByText(/D001/)).toBeInTheDocument()

    rerender(<SearchFormDossier {...dossierSearchProps} value="D002" />)

    expect(screen.getByText(/D002/)).toBeInTheDocument()

    rerender(<SearchFormDossier {...dossierSearchProps} value="D003" />)

    expect(screen.getByText(/D003/)).toBeInTheDocument()
  })

  it('handles changing from value to null', async () => {
    const { rerender } = render(
      <SearchFormDossier {...dossierSearchProps} value="D001" />,
    )

    expect(await screen.findByText(/D001/)).toBeInTheDocument()

    rerender(<SearchFormDossier {...dossierSearchProps} value={null} />)

    expect(screen.queryByText(/D001/)).not.toBeInTheDocument()
  })
})
