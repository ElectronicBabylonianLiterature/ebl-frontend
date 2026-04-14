import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FolioDropdown from './FolioDropdown'
import Folio from 'fragmentarium/domain/Folio'
import { TabController } from 'fragmentarium/ui/images/Images'

describe('FolioDropdown', () => {
  let folios: Folio[]
  let controller: TabController

  const setup = (): void => {
    folios = [
      new Folio({ name: 'GS', number: '1' }),
      new Folio({ name: 'ER', number: '2' }),
    ]

    controller = {
      openTab: jest.fn(),
    } as unknown as TabController

    render(<FolioDropdown folios={folios} controller={controller} />)
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

  it('calls controller.openTab when a dropdown item is clicked', async () => {
    setup()
    await userEvent.click(screen.getByText('Folios'))

    fireEvent.click(screen.getByText('Smith Folio 1'))

    expect(controller.openTab).toHaveBeenCalledWith('0')
  })
})
