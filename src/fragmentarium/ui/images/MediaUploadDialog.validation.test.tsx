import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  applyShared,
  file,
  fill,
  prepareUploadMocks,
  setup,
} from 'fragmentarium/ui/images/mediaUploadDialog.testSupport'

beforeEach(prepareUploadMocks)

test('blocks an entry whose metadata is too long to upload and explains why', async () => {
  const { upload } = setup()
  await userEvent.upload(
    screen.getByLabelText('Choose images or drop them here'),
    [file(), file('reverse.png')],
  )
  await fill()
  await fill('reverse.png')
  const entry = within(
    screen.getByRole('region', { name: 'Upload obverse.png' }),
  )
  fireEvent.change(entry.getByLabelText('Additional context'), {
    target: { value: 'š'.repeat(2000) },
  })
  fireEvent.change(entry.getByLabelText('Photographer or creator'), {
    target: { value: 'ṣ'.repeat(2000) },
  })
  const tooLong = entry.getByRole('alert')
  expect(tooLong).toHaveTextContent(
    "obverse.png: This image's metadata is too long to upload. Shorten the description, caption or other text fields.",
  )
  expect(entry.getByLabelText('Additional context')).toHaveAttribute(
    'aria-invalid',
    'true',
  )
  expect(entry.getByLabelText('Additional context')).toHaveAttribute(
    'aria-describedby',
    tooLong.id,
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  await screen.findByText('Submitted for review')
  expect(upload).toHaveBeenCalledTimes(1)
  expect(upload.mock.calls[0][1].name).toBe('reverse.png')
  expect(entry.getByText('Ready to upload')).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Submit images for review' }),
  ).toBeDisabled()

  fireEvent.change(entry.getByLabelText('Additional context'), {
    target: { value: 'Lower edge' },
  })
  fireEvent.change(entry.getByLabelText('Photographer or creator'), {
    target: { value: 'A. Photographer' },
  })
  expect(entry.queryByRole('alert')).not.toBeInTheDocument()
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  await waitFor(() => expect(upload).toHaveBeenCalledTimes(2))
  expect(upload.mock.calls[1][2].description).toBe('Lower edge')
})

test('applying shared rights keeps each image’s own description and creator', async () => {
  const { upload } = setup()
  await userEvent.upload(
    screen.getByLabelText('Choose images or drop them here'),
    file(),
  )
  await fill()
  const entry = within(
    screen.getByRole('region', { name: 'Upload obverse.png' }),
  )
  fireEvent.change(entry.getByLabelText('Additional context'), {
    target: { value: 'Lower edge' },
  })
  fireEvent.change(entry.getByLabelText('Photographer or creator'), {
    target: { value: 'A. Photographer' },
  })
  fireEvent.change(
    screen.getAllByLabelText('Rights / reproduction statement')[0],
    { target: { value: 'CC BY 4.0' } },
  )
  await applyShared()
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  await waitFor(() => expect(upload).toHaveBeenCalledTimes(1))
  expect(upload.mock.calls[0][2]).toMatchObject({
    caption: 'Obverse',
    description: 'Lower edge',
    creator: 'A. Photographer',
    rightsStatement: 'CC BY 4.0',
    permissionAttested: true,
  })
})
