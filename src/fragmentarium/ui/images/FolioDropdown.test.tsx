import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FolioDropdown from 'fragmentarium/ui/images/FolioDropdown'
import Folio from 'fragmentarium/domain/Folio'

describe('FolioDropdown', () => {
  let folios: Folio[]
  let onOpenFolio: jest.Mock

  const setup = (): void => {
    folios = [
      new Folio({ name: 'GS', number: '1' }),
      new Folio({ name: 'ER', number: '2' }),
    ]

    onOpenFolio = jest.fn()

    render(<FolioDropdown folios={folios} onOpenFolio={onOpenFolio} />)
  }

  it('renders the dropdown toggle', () => {
    setup()
    expect(screen.getByText('Folios')).toBeInTheDocument()
  })

  it('renders dropdown items for each folio', async () => {
    setup()
    await userEvent.click(screen.getByText('Folios'))

    expect(screen.getByText('Smith Folio 1')).toBeInTheDocument()
    expect(screen.getByText('Reiner Folio 2')).toBeInTheDocument()
  })

  it('opens the clicked folio', async () => {
    setup()
    await userEvent.click(screen.getByText('Folios'))

    fireEvent.click(screen.getByText('Smith Folio 1'))

    expect(onOpenFolio).toHaveBeenCalledWith(0)
  })
})
