import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  file,
  fill,
  prepareUploadMocks,
  setup,
} from 'fragmentarium/ui/images/mediaUploadDialog.testSupport'

beforeEach(prepareUploadMocks)

test('selects multiple images, validates metadata, submits and announces review status', async () => {
  const { upload, onChanged } = setup()
  await userEvent.upload(
    screen.getByLabelText('Choose images or drop them here'),
    [file(), file('reverse.png')],
  )
  expect(screen.getAllByAltText(/Preview of/)).toHaveLength(2)
  await fill()
  await fill('reverse.png')
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  await waitFor(() => expect(upload).toHaveBeenCalledTimes(2))
  expect(await screen.findAllByText('Submitted for review')).toHaveLength(2)
  expect(onChanged).toHaveBeenCalledTimes(2)
  expect(upload.mock.calls[0][0]).toBe('K.1')
  expect(upload.mock.calls[0][2]).toMatchObject({
    permissionAttested: true,
    caption: 'Obverse',
  })
})

test.each([
  [
    'Bibliography identifiers (comma separated)',
    'RN1, RN2',
    'references',
    [{ id: 'RN1' }, { id: 'RN2' }],
  ],
  [
    'Research projects (CAIC, ALU_GENEVA, AMPS, RECC; comma separated)',
    'CAIC, AMPS',
    'projects',
    ['CAIC', 'AMPS'],
  ],
])(
  'uploads the current %s when submitted with Enter',
  async (label, identifiers, field, expected) => {
    const { upload } = setup()
    await userEvent.upload(
      screen.getByLabelText('Choose images or drop them here'),
      file(),
    )
    await fill()
    const entry = within(
      screen.getByRole('region', { name: 'Upload obverse.png' }),
    )
    await userEvent.type(
      entry.getByLabelText(label as string),
      `${identifiers}{Enter}`,
    )
    await screen.findByText('Submitted for review')
    expect(upload).toHaveBeenCalledTimes(1)
    expect(upload.mock.calls[0][2]).toMatchObject({
      [field as string]: expected,
    })
  },
)

test('supports drop selection, removal and rejects unsupported files', async () => {
  setup()
  fireEvent.drop(screen.getByRole('group', { name: 'Image file selection' }), {
    dataTransfer: {
      files: [file(), new File(['svg'], 'bad.svg', { type: 'image/svg+xml' })],
    },
  })
  expect(screen.getByRole('alert')).toHaveTextContent('bad.svg')
  await userEvent.click(
    screen.getByRole('button', { name: 'Remove obverse.png' }),
  )
  expect(screen.queryByAltText(/Preview of/)).not.toBeInTheDocument()
  expect(URL.revokeObjectURL).toHaveBeenCalled()
})

test('selecting the same original again never creates an accidental duplicate upload entry', async () => {
  setup()
  const selected = file()
  const picker = screen.getByLabelText('Choose images or drop them here')
  await userEvent.upload(picker, selected)
  await userEvent.upload(picker, selected)
  expect(screen.getByRole('alert')).toHaveTextContent(
    'this file is already selected',
  )
  expect(
    screen.getAllByRole('region', { name: 'Upload obverse.png' }),
  ).toHaveLength(1)
  fireEvent.drop(screen.getByRole('group', { name: 'Image file selection' }), {
    dataTransfer: { files: [selected, selected] },
  })
  expect(screen.getAllByAltText('Preview of obverse.png')).toHaveLength(1)
})
