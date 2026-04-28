import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DateFieldPatternsHelp from 'chronology/ui/DateEditor/DateFieldPatternsHelp'

describe('DateFieldPatternsHelp', () => {
  it('renders the help trigger', () => {
    render(<DateFieldPatternsHelp />)
    expect(
      screen.getByRole('button', { name: /allowed date field patterns/i }),
    ).toBeInTheDocument()
  })

  it.each([
    ['n', 'a number (e.g. 12)'],
    ['x', 'unclear number'],
    ['n+', 'number with plus (e.g. 12+)'],
    ['x+n', 'x plus number (e.g. x+12)'],
    ['n-n', 'number range (e.g. 12-13)'],
    ['n/n', 'number or number (e.g. 12/13)'],
    ['n[a-z]', 'number with letter (e.g. 12a, 12b; for year variants)'],
  ])('shows pattern %s on hover', async (pattern, explanation) => {
    render(<DateFieldPatternsHelp />)
    await userEvent.hover(
      screen.getByRole('button', { name: /allowed date field patterns/i }),
    )
    expect(await screen.findByText(pattern)).toBeInTheDocument()
    expect(screen.getByText(explanation)).toBeInTheDocument()
  })
})
