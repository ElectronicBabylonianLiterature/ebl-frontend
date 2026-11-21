import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmModal from 'corpus/ui/edit-lite/ConfirmModal'

interface Handlers {
  readonly onConfirm: jest.Mock<void, []>
  readonly onCancel: jest.Mock<void, []>
}

function renderModal(
  show = true,
  confirmVariant?: 'danger' | 'primary',
): Handlers {
  const handlers: Handlers = { onConfirm: jest.fn(), onCancel: jest.fn() }
  render(
    <ConfirmModal
      show={show}
      title="Delete line"
      confirmLabel="Delete it"
      confirmVariant={confirmVariant}
      {...handlers}
    >
      Delete line 7 from the chapter?
    </ConfirmModal>,
  )
  return handlers
}

test('shows nothing while it is not asked', () => {
  renderModal(false)

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('asks the question in a dialog named by its title', () => {
  renderModal()
  const dialog = screen.getByRole('dialog', { name: 'Delete line' })

  expect(
    within(dialog).getByText('Delete line 7 from the chapter?'),
  ).toBeVisible()
  expect(
    within(dialog).getByRole('button', { name: 'Delete it' }),
  ).toBeVisible()
  expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeVisible()
})

test.each<['danger' | 'primary' | undefined, string]>([
  [undefined, 'btn-danger'],
  ['danger', 'btn-danger'],
  ['primary', 'btn-primary'],
])('the confirm button of variant %p looks like %s', (variant, className) => {
  renderModal(true, variant)

  expect(screen.getByRole('button', { name: 'Delete it' })).toHaveClass(
    className,
  )
})

test('confirming reports the confirmation only', async () => {
  const { onConfirm, onCancel } = renderModal()
  await userEvent.click(screen.getByRole('button', { name: 'Delete it' }))

  expect(onConfirm).toHaveBeenCalledTimes(1)
  expect(onCancel).not.toHaveBeenCalled()
})

test.each([
  ['Cancel', (): HTMLElement => screen.getByRole('button', { name: 'Cancel' })],
  ['the close icon', (): HTMLElement => screen.getByLabelText('Close')],
])('%s reports the cancellation only', async (_name, findControl) => {
  const { onConfirm, onCancel } = renderModal()
  await userEvent.click(findControl())

  expect(onCancel).toHaveBeenCalledTimes(1)
  expect(onConfirm).not.toHaveBeenCalled()
})

test('Escape cancels', async () => {
  const { onConfirm, onCancel } = renderModal()
  await userEvent.keyboard('{Escape}')

  expect(onCancel).toHaveBeenCalledTimes(1)
  expect(onConfirm).not.toHaveBeenCalled()
})
