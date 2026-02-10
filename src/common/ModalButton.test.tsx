import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ModalButton from './ModalButton'

describe('ModalButton', () => {
  it('shows modal dialog when button is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = jest.fn()

    render(
      <ModalButton
        show={false}
        onToggle={onToggle}
        toggle={<span>Toggle</span>}
        dialog={<div>Dialog Content</div>}
      />,
    )

    const button = screen.getByRole('button')
    await user.click(button)

    expect(onToggle).toHaveBeenCalledWith(true)
  })

  it('renders modal with dialog role when show is true', async () => {
    const onToggle = jest.fn()

    render(
      <ModalButton
        show={true}
        onToggle={onToggle}
        toggle={<span>Toggle</span>}
        dialog={<div>Dialog Content</div>}
      />,
    )

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeVisible()
    expect(screen.getByText('Dialog Content')).toBeVisible()
  })

  it('modal is not visible when show is false', () => {
    const onToggle = jest.fn()

    render(
      <ModalButton
        show={false}
        onToggle={onToggle}
        toggle={<span>Toggle</span>}
        dialog={<div>Dialog Content</div>}
      />,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
