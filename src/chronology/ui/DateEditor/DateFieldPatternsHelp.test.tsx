import React from 'react'
import { render, screen } from '@testing-library/react'
import DateFieldPatternsHelp from './DateFieldPatternsHelp'

describe('DateFieldPatternsHelp', () => {
  it('renders the info icon', () => {
    render(<DateFieldPatternsHelp />)
    expect(screen.getByTestId('help-icon')).toBeInTheDocument()
  })
})
