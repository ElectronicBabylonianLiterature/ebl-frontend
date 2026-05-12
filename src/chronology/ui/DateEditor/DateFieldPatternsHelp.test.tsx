import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DateFieldPatternsHelp, {
  dateFieldPatterns,
} from 'chronology/ui/DateEditor/DateFieldPatternsHelp'

describe('DateFieldPatternsHelp', () => {
  it('renders the help trigger', () => {
    render(<DateFieldPatternsHelp />)
    expect(
      screen.getByRole('button', { name: /allowed date field patterns/i }),
    ).toBeInTheDocument()
  })

  it.each(
    dateFieldPatterns.map(({ pattern, explanation }) => [pattern, explanation]),
  )('shows pattern %s on hover', async (pattern, explanation) => {
    render(<DateFieldPatternsHelp />)
    await userEvent.hover(
      screen.getByRole('button', { name: /allowed date field patterns/i }),
    )
    expect(await screen.findByText(pattern)).toBeInTheDocument()
    expect(screen.getByText(explanation)).toBeInTheDocument()
  })
})
