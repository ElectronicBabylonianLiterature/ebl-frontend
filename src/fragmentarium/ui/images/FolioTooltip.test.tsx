import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import FolioTooltip from './FolioTooltip'
import '@testing-library/jest-dom/extend-expect'

describe('FolioTooltip', () => {
  const mockProps = {
    folioInitials: 'GS',
    folioName: 'Smith Folio',
  }

  beforeEach(() => {
    render(<FolioTooltip {...mockProps} />)
  })

  it('renders the info icon trigger', () => {
    expect(screen.getByTestId('info-icon')).toBeInTheDocument()
  })

  it('contains a valid external link', async () => {
    const trigger = screen.getByTestId('tooltip-trigger')

    act(() => {
      fireEvent.mouseOver(trigger)
    })

    const link = await screen.findByRole('link')
    expect(link).toHaveAttribute('href', '/about/library#GS')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByTestId('external-link-icon')).toBeInTheDocument()
  })
})
