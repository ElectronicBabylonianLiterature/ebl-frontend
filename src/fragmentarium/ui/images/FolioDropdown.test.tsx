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
    fragmentService = {} as jest.Mocked<FragmentService>

    fragment = {} as Fragment

    folios = [
      new Folio({ name: 'GS', number: '1' }),
      new Folio({ name: 'ER', number: '2' }),
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
