import {
  act,
  createEvent,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  file,
  fill,
  prepareUploadMocks,
  setup,
} from 'fragmentarium/ui/images/mediaUploadDialog.testSupport'
import { mediaFixture } from 'fragmentarium/ui/images/gallery.testSupport'

beforeEach(prepareUploadMocks)

test('accepts a drag operation and ignores an empty file-picker event', () => {
  const { upload } = setup()
  const area = screen.getByRole('group', { name: 'Image file selection' })
  const drag = createEvent.dragOver(area)
  fireEvent(area, drag)
  expect(drag.defaultPrevented).toBe(true)
  fireEvent.change(screen.getByLabelText('Choose images or drop them here'), {
    target: { files: null },
  })
  expect(
    screen.queryByRole('region', { name: /Upload/ }),
  ).not.toBeInTheDocument()
  expect(upload).not.toHaveBeenCalled()
})

test('ignores dropped files during an active upload and announces a published response', async () => {
  let resolve = (_media: ReturnType<typeof mediaFixture>): void => undefined
  const upload = jest.fn(
    () =>
      new Promise<ReturnType<typeof mediaFixture>>((complete) => {
        resolve = complete
      }),
  )
  setup(upload)
  await userEvent.upload(
    screen.getByLabelText('Choose images or drop them here'),
    file(),
  )
  await fill()
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  await waitFor(() => expect(upload).toHaveBeenCalledTimes(1))
  fireEvent.drop(screen.getByRole('group', { name: 'Image file selection' }), {
    dataTransfer: { files: [file('ignored.png')] },
  })
  expect(
    screen.queryByRole('region', { name: 'Upload ignored.png' }),
  ).not.toBeInTheDocument()
  await act(async () =>
    resolve(mediaFixture({ publicationStatus: 'PUBLISHED' })),
  )
  expect(await screen.findByText('Published')).toBeVisible()
  expect(
    screen.getByRole('button', { name: 'Submit images for review' }),
  ).toBeDisabled()
})
