import React from 'react'
import { render, screen } from '@testing-library/react'
import RealiaDevelopmentNotice from 'realia/ui/RealiaDevelopmentNotice'

describe('RealiaDevelopmentNotice', () => {
  it('renders a friendly development warning', () => {
    render(<RealiaDevelopmentNotice />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('alert-warning')
    expect(alert).toHaveTextContent(/still under active development/i)
    expect(alert).toHaveTextContent(/apologies for any issues/i)
  })
})
