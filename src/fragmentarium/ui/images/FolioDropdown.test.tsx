import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import FolioDropdown from './FolioDropdown'
import { Fragment } from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import FragmentService from 'fragmentarium/application/FragmentService'
import { TabController } from 'fragmentarium/ui/images/Images'

describe('FolioDropdown', () => {
  let fragmentService: jest.Mocked<FragmentService>
  let fragment: Fragment
  let folios: Folio[]
  let controller: TabController

  beforeEach(() => {
    fragmentService = {
      // Mock any methods used by the component
    } as jest.Mocked<FragmentService>

    fragment = {
      // Mock fragment properties as needed
    } as Fragment

    folios = [
      new Folio({ name: 'folio1', number: '1' }),
      new Folio({ name: 'folio2', number: '2' }),
    ]

    controller = ({
      openTab: jest.fn(),
    } as unknown) as TabController

    render(
      <FolioDropdown
        fragmentService={fragmentService}
        fragment={fragment}
        folios={folios}
        controller={controller}
      />
    )
  })

  it('renders the dropdown toggle', () => {
    expect(screen.getByText('Folios')).toBeInTheDocument()
  })

  it('renders dropdown items for each folio', () => {
    act(() => {
      fireEvent.click(screen.getByText('Folios')) // Open the dropdown
    })

    expect(screen.getByText('folio1 Folio 1')).toBeInTheDocument()
    expect(screen.getByText('folio2 Folio 2')).toBeInTheDocument()
  })

  it('calls controller.openTab when a dropdown item is clicked', () => {
    act(() => {
      fireEvent.click(screen.getByText('Folios')) // Open the dropdown
    })

    act(() => {
      fireEvent.click(screen.getByText('folio1 Folio 1'))
    })

    expect(controller.openTab).toHaveBeenCalledWith('0', expect.anything())
  })
})
