import React from 'react'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import FolioTooltip from 'fragmentarium/ui/images/FolioTooltip'
import '@testing-library/jest-dom'

describe('FolioTooltip', () => {
  describe('basic functionality', () => {
    const mockProps = {
      folioInitials: 'GS',
      folioName: 'Smith Folio',
    }

    const setup = (): void => {
      render(<FolioTooltip {...mockProps} />)
    }

    it('renders the info icon trigger', () => {
      setup()
      expect(screen.getByTestId('info-icon')).toBeInTheDocument()
    })

    it('contains a valid external link', async () => {
      setup()
      const trigger = screen.getByTestId('tooltip-trigger')

      fireEvent.mouseOver(trigger)

      const link = await screen.findByRole('link')
      expect(link).toHaveAttribute('href', '/about/library#GS')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(screen.getByTestId('external-link-icon')).toBeInTheDocument()
    })
  })

  describe('folio mapping', () => {
    it('maps folio initials according to folio mapping', async () => {
      const mappedProps = {
        folioInitials: 'ARGC',
        folioName: 'George Copies',
      }

      render(<FolioTooltip {...mappedProps} />)
      const trigger = screen.getByTestId('tooltip-trigger')

      fireEvent.mouseOver(trigger)

      const link = await screen.findByRole('link')
      expect(link).toHaveAttribute('href', '/about/library#ARG')
    })

    it('does not transform unmapped folio initials', async () => {
      const unmappedProps = {
        folioInitials: 'ARG',
        folioName: 'George',
      }

      render(<FolioTooltip {...unmappedProps} />)
      const trigger = screen.getByTestId('tooltip-trigger')

      fireEvent.mouseOver(trigger)

      const link = await screen.findByRole('link')
      expect(link).toHaveAttribute('href', '/about/library#ARG')
    })
  })

  describe('hover behaviour', () => {
    const showTooltip = async (): Promise<HTMLElement> => {
      render(<FolioTooltip folioInitials="GS" folioName="Smith Folio" />)
      fireEvent.mouseEnter(screen.getByTestId('tooltip-trigger'))
      return screen.findByRole('tooltip')
    }

    it('hides the tooltip shortly after the pointer leaves the trigger', async () => {
      await showTooltip()

      fireEvent.mouseLeave(screen.getByTestId('tooltip-trigger'))

      await waitForElementToBeRemoved(() => screen.queryByRole('tooltip'))
    })

    it('keeps the tooltip while the pointer has moved onto it', async () => {
      const tooltip = await showTooltip()
      const querySelector = jest
        .spyOn(document, 'querySelector')
        .mockReturnValue(tooltip)

      fireEvent.mouseLeave(screen.getByTestId('tooltip-trigger'))
      await waitFor(() =>
        expect(querySelector).toHaveBeenCalledWith('.folio-tooltip:hover'),
      )

      expect(screen.getByRole('tooltip')).toBeInTheDocument()
      querySelector.mockRestore()
    })

    it('closes when the pointer leaves the tooltip', async () => {
      const tooltip = await showTooltip()

      fireEvent.mouseEnter(tooltip)
      fireEvent.mouseLeave(tooltip)

      await waitForElementToBeRemoved(() => screen.queryByRole('tooltip'))
    })

    it('keeps a click on the link from reaching the surrounding tab', async () => {
      const onTabClick = jest.fn()
      render(
        <div onClick={onTabClick}>
          <FolioTooltip folioInitials="GS" folioName="Smith Folio" />
        </div>,
      )
      fireEvent.mouseEnter(screen.getByTestId('tooltip-trigger'))

      fireEvent.click(await screen.findByRole('link'))

      expect(onTabClick).not.toHaveBeenCalled()
    })
  })
})
