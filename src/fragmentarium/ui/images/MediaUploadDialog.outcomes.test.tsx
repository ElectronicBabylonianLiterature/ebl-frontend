import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  abortable,
  prepareUploadMocks,
  setup,
  submitOne,
} from 'fragmentarium/ui/images/mediaUploadDialog.testSupport'
import { ApiError } from 'http/ApiError'

beforeEach(prepareUploadMocks)

test('cancelling an in-flight upload refreshes the gallery because the server may have committed it', async () => {
  const upload = abortable()
  const { onChanged } = setup(upload)
  await submitOne(upload)
  await userEvent.click(
    screen.getByRole('button', { name: 'Cancel obverse.png' }),
  )
  await screen.findByRole('button', { name: 'Retry obverse.png' })
  expect(onChanged).toHaveBeenCalledTimes(1)
  expect(screen.queryByText('Submitted for review')).not.toBeInTheDocument()
})

test('unmounting an in-flight upload never refreshes', async () => {
  const upload = abortable()
  const { onChanged, unmount } = setup(upload)
  await submitOne(upload)
  unmount()
  await act(async () => undefined)
  expect(onChanged).not.toHaveBeenCalled()
})

test.each([
  ['a network failure', new ApiError('Upload connection failed', {}, 0)],
  ['a gateway timeout', new ApiError('Gateway Timeout', {}, 504)],
  [
    'an unreadable response',
    new Error('The upload response could not be read.'),
  ],
])(
  'an upload failing with %s refreshes the gallery and keeps the retry',
  async (_name, error) => {
    const upload = jest.fn().mockRejectedValueOnce(error)
    const { onChanged } = setup(upload)
    await submitOne(upload)
    expect(await screen.findByRole('alert')).toHaveTextContent(error.message)
    expect(
      screen.getByRole('button', { name: 'Retry obverse.png' }),
    ).toBeVisible()
    expect(onChanged).toHaveBeenCalledTimes(1)
  },
)

test('an upload definitively rejected by the server does not refresh the gallery', async () => {
  const upload = jest
    .fn()
    .mockRejectedValueOnce(new ApiError('File too large', {}, 413))
  const { onChanged } = setup(upload)
  await submitOne(upload)
  expect(await screen.findByRole('alert')).toHaveTextContent('File too large')
  expect(onChanged).not.toHaveBeenCalled()
})
