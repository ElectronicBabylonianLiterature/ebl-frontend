import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CollapseExpandButton from './CollapseExpandButton'

describe('CollapseExpandButton', () => {
  it('renders with initial text', () => {
    render(<CollapseExpandButton onToggle={jest.fn()} />)
    const button = screen.getByRole('button', { name: /Hide Image Column/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Hide Image Column')
  })

  it('toggles text and calls onToggle when clicked', async () => {
    const handleToggle = jest.fn()
    render(<CollapseExpandButton onToggle={handleToggle} />)
    const button = screen.getByRole('button', { name: /Hide Image Column/i })

    await userEvent.click(button)
    expect(button).toHaveTextContent('Show Image Column')
    expect(handleToggle).toHaveBeenCalledWith(true)

    await userEvent.click(button)
    expect(button).toHaveTextContent('Hide Image Column')
    expect(handleToggle).toHaveBeenCalledWith(false)
  })

  it.each([
    [true, 'Show Image Column'],
    [false, 'Hide Image Column'],
  ])(
    'renders with %s text when initialCollapsed is %s',
    (initialCollapsed, expectedText) => {
      render(
        <CollapseExpandButton
          onToggle={jest.fn()}
          initialCollapsed={initialCollapsed}
        />,
      )
      const button = screen.getByRole('button', {
        name: new RegExp(expectedText, 'i'),
      })
      expect(button).toHaveTextContent(expectedText)
    },
  )
})
