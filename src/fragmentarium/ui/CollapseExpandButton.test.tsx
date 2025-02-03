import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CollapseExpandButton from './CollapseExpandButton'

describe('CollapseExpandButton', () => {
  afterEach(() => {
    cleanup()
  })

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

  it('renders with collapsed text when initialCollapsed is true', () => {
    render(
      <CollapseExpandButton onToggle={jest.fn()} initialCollapsed={true} />
    )
    const button = screen.getByRole('button', { name: /Show Image Column/i })
    expect(button).toHaveTextContent('Show Image Column')
  })

  it('renders with expanded text when initialCollapsed is false', () => {
    render(
      <CollapseExpandButton onToggle={jest.fn()} initialCollapsed={false} />
    )
    const button = screen.getByRole('button', { name: /Hide Image Column/i })
    expect(button).toHaveTextContent('Hide Image Column')
  })
})
