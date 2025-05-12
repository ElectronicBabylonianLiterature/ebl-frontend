import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import FolioDropdown from './FolioDropdown'
import Folio from 'fragmentarium/domain/Folio'
import { TabController } from 'fragmentarium/ui/images/Images'

describe('FolioDropdown', () => {
  let folios: Folio[]
  let controller: TabController

  beforeEach(() => {
    folios = [
      new Folio({ name: 'GS', number: '1' }),
      new Folio({ name: 'ER', number: '2' }),
    ]

    controller = ({
      openTab: jest.fn(),
    } as unknown) as TabController

    render(<FolioDropdown folios={folios} controller={controller} />)
  })

  it('renders the dropdown toggle', () => {
    expect(screen.getByText('Folios')).toBeInTheDocument()
  })

  it('renders dropdown items for each folio', async () => {
    await act(async () => {
      fireEvent.click(screen.getByText('Folios'))
    })

    expect(screen.getByText('Smith Folio 1')).toBeInTheDocument()
    expect(screen.getByText('Reiner Folio 2')).toBeInTheDocument()
  })

  it('calls controller.openTab when a dropdown item is clicked', () => {
    act(() => {
      fireEvent.click(screen.getByText('Folios'))
    })

    act(() => {
      fireEvent.click(screen.getByText('Smith Folio 1'))
    })

    expect(controller.openTab).toHaveBeenCalledWith('0', expect.anything())
  })
})
