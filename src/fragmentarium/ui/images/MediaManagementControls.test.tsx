import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mediaFixture } from 'fragmentarium/ui/images/gallery.testSupport'
import { setup } from 'fragmentarium/ui/images/mediaManagementControls.testSupport'
import { ApiError } from 'http/ApiError'

test('StrictMode replay leaves a live cancellation signal for manager mutations', async () => {
  const { management, onChanged } = setup({ strict: true })
  await userEvent.click(screen.getByRole('button', { name: 'Set as primary' }))
  await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1))
  expect(management.setPrimary).toHaveBeenCalledWith(
    'K.1',
    expect.any(String),
    expect.any(AbortSignal),
    undefined,
  )
  expect(management.setPrimary.mock.calls[0][2].aborted).toBe(false)
})

test('legacy caption editing sends only the changed domain metadata', async () => {
  const { management, onChanged } = setup({
    media: mediaFixture({ caption: 'Original caption' }),
  })
  await userEvent.click(
    screen.getByRole('button', { name: 'Edit image metadata' }),
  )
  const caption = screen.getByLabelText('Caption or short description')
  await userEvent.clear(caption)
  await userEvent.type(caption, 'Corrected caption')
  await userEvent.click(screen.getByRole('button', { name: 'Save metadata' }))
  await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1))
  expect(management.update).toHaveBeenCalledWith(
    'K.1',
    expect.any(String),
    { caption: 'Corrected caption' },
    expect.any(AbortSignal),
    undefined,
  )
  expect(
    screen.queryByRole('button', { name: 'Reject image' }),
  ).not.toBeInTheDocument()
})

test('contributors can edit their own pending caption while publication rights stay locked', async () => {
  const { management } = setup({
    manager: false,
    media: mediaFixture({
      uploaderId: 'auth0|owner',
      publicationStatus: 'PENDING_REVIEW',
      caption: 'Before',
      rightsStatement: 'Authorized reproduction',
      permissionAttested: true,
    }),
  })
  expect(
    screen.queryByRole('button', { name: 'Publish image' }),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Remove image' }),
  ).not.toBeInTheDocument()
  await userEvent.click(
    screen.getByRole('button', { name: 'Edit image metadata' }),
  )
  expect(
    screen.getByLabelText('Rights / reproduction statement'),
  ).toBeDisabled()
  expect(screen.getByRole('checkbox')).toBeDisabled()
  const caption = screen.getByLabelText('Caption or short description')
  await userEvent.clear(caption)
  await userEvent.type(caption, 'After')
  await userEvent.click(screen.getByRole('button', { name: 'Save metadata' }))
  await waitFor(() => expect(management.update).toHaveBeenCalledTimes(1))
  expect(management.update.mock.calls[0][2]).toEqual({ caption: 'After' })
})

test('own rejected submissions show status and review feedback without edit controls', () => {
  setup({
    manager: false,
    media: mediaFixture({
      uploaderId: 'auth0|owner',
      publicationStatus: 'REJECTED',
      reviewReason: 'Please supply a sharper image.',
    }),
  })
  expect(screen.getByRole('status')).toHaveTextContent('Rejected')
  expect(screen.getByText(/Please supply a sharper image/)).toBeVisible()
  expect(
    screen.queryByRole('button', { name: 'Edit image metadata' }),
  ).not.toBeInTheDocument()
})

test('a rejected primary change reports the error without refreshing the gallery', async () => {
  const { management, onChanged } = setup()
  management.setPrimary.mockRejectedValueOnce(
    new ApiError('Primary change denied', {}, 403),
  )
  await userEvent.click(screen.getByRole('button', { name: 'Set as primary' }))
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Primary change denied',
  )
  expect(onChanged).not.toHaveBeenCalled()
})

test.each([
  ['a gateway timeout', new ApiError('Gateway Timeout', {}, 504)],
  ['a network failure', new ApiError('Network failure', {}, 0)],
  ['an unreadable response', new Error('Response could not be read')],
])(
  'a publish failing with %s surfaces the error and refreshes the gallery',
  async (_name, error) => {
    const media = mediaFixture({
      publicationStatus: 'PENDING_REVIEW',
      permissionAttested: true,
      rightsStatement: 'Permission granted',
    })
    const { management, onChanged } = setup({ media })
    management.publish.mockRejectedValueOnce(error)
    await userEvent.click(screen.getByRole('button', { name: 'Publish image' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(error.message)
    expect(onChanged).toHaveBeenCalledTimes(1)
  },
)

test('removal needs confirmation and refreshes only after server success', async () => {
  const { management, onChanged } = setup()
  management.remove.mockRejectedValueOnce(
    new ApiError('Removal failed', {}, 403),
  )
  await userEvent.click(screen.getByRole('button', { name: 'Remove image' }))
  expect(management.remove).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: 'Confirm removal' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Removal failed')
  expect(onChanged).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: 'Confirm removal' }))
  await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1))
})

test('manager publication and rejection use explicit confirmed actions', async () => {
  const media = mediaFixture({
    publicationStatus: 'PENDING_REVIEW',
    permissionAttested: true,
    rightsStatement: 'Permission granted',
  })
  const { management, onChanged } = setup({ media })
  await userEvent.click(screen.getByRole('button', { name: 'Publish image' }))
  await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1))
  await userEvent.click(screen.getByRole('button', { name: 'Reject image' }))
  await userEvent.type(
    screen.getByLabelText('Review reason (optional)'),
    'Review note',
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Confirm rejection' }),
  )
  await waitFor(() =>
    expect(management.reject).toHaveBeenCalledWith(
      'K.1',
      media.id,
      'Review note',
      expect.any(AbortSignal),
      undefined,
    ),
  )
})
