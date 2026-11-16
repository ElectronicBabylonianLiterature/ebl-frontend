import React from 'react'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import type MediaManagementDialog from 'fragmentarium/ui/images/MediaManagementDialog'
import { setup } from 'fragmentarium/ui/images/mediaManagementControls.testSupport'

jest.mock('fragmentarium/ui/images/MediaManagementDialog', () => ({
  __esModule: true,
  default: ({
    dialog,
    onHide,
    onSubmit,
  }: ComponentProps<typeof MediaManagementDialog>) =>
    dialog ? (
      <div role="dialog">
        <button onClick={onSubmit}>Save</button>
        <button onClick={onHide}>Dismiss</button>
      </div>
    ) : null,
}))

test('a late dialog dismissal cannot close an edit whose mutation is still pending', async () => {
  const { management, onChanged } = setup()
  let resolve = (): void => undefined
  management.update.mockReturnValue(
    new Promise<void>((done) => {
      resolve = done
    }),
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Edit image metadata' }),
  )
  await userEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(management.update).toHaveBeenCalledTimes(1)
  await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(onChanged).not.toHaveBeenCalled()
  await act(async () => resolve())
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(onChanged).toHaveBeenCalledTimes(1)
})
