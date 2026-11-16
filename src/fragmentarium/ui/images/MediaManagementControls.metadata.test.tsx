import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mediaFixture } from 'fragmentarium/ui/images/gallery.testSupport'
import { setup } from 'fragmentarium/ui/images/mediaManagementControls.testSupport'

test('keyboard dismissal returns focus to the management action', async () => {
  setup()
  const trigger = screen.getByRole('button', { name: 'Remove image' })
  await userEvent.click(trigger)
  const dialog = screen.getByRole('dialog', { name: 'Remove image?' })
  expect(dialog).toHaveFocus()
  await userEvent.keyboard('{Escape}')
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  )
  expect(trigger).toHaveFocus()
})

test.each(['Cancel', 'Escape'])(
  'discarded metadata drafts reset when reopening after %s',
  async (dismissal) => {
    const { management } = setup({
      media: mediaFixture({
        caption: 'Original caption',
        rightsStatement: 'Original rights',
        publicationStatus: 'PUBLISHED',
        permissionAttested: true,
      }),
    })
    const open = () =>
      userEvent.click(
        screen.getByRole('button', { name: 'Edit image metadata' }),
      )
    await open()
    const rights = screen.getByLabelText('Rights / reproduction statement')
    await userEvent.clear(rights)
    await userEvent.type(rights, 'Cancelled rights correction')
    if (dismissal === 'Escape') await userEvent.keyboard('{Escape}')
    else await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    await open()
    expect(
      screen.getByLabelText('Rights / reproduction statement'),
    ).toHaveValue('Original rights')
    const caption = screen.getByLabelText('Caption or short description')
    await userEvent.clear(caption)
    await userEvent.type(caption, 'New caption')
    await userEvent.click(screen.getByRole('button', { name: 'Save metadata' }))
    await waitFor(() => expect(management.update).toHaveBeenCalledTimes(1))
    expect(management.update.mock.calls[0][2]).toEqual({
      caption: 'New caption',
    })
  },
)

test('bibliography and research project lists can be typed with comma delimiters', async () => {
  const { management } = setup({
    media: mediaFixture({
      caption: 'Original caption',
      publicationStatus: 'PUBLISHED',
      rightsStatement: 'Permission granted',
      permissionAttested: true,
    }),
  })
  await userEvent.click(
    screen.getByRole('button', { name: 'Edit image metadata' }),
  )
  await userEvent.type(
    screen.getByLabelText('Bibliography identifiers (comma separated)'),
    'first-id, second-id',
  )
  await userEvent.type(screen.getByLabelText(/Research projects/), 'CAIC, AMPS')
  await userEvent.click(screen.getByRole('button', { name: 'Save metadata' }))
  await waitFor(() => expect(management.update).toHaveBeenCalledTimes(1))
  expect(management.update.mock.calls[0][2]).toEqual({
    references: [{ id: 'first-id' }, { id: 'second-id' }],
    projects: ['CAIC', 'AMPS'],
  })
})

test('managers can correct legacy rights without inventing uploader permission or review state', async () => {
  const { management, onChanged } = setup({ media: mediaFixture() })
  await userEvent.click(
    screen.getByRole('button', { name: 'Edit image metadata' }),
  )
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/Research projects/)).not.toBeInTheDocument()
  await userEvent.type(
    screen.getByLabelText('Photographer or creator'),
    'Original photographer',
  )
  await userEvent.type(
    screen.getByLabelText('Source institution (where applicable)'),
    'Museum archive',
  )
  await userEvent.type(
    screen.getByLabelText('Copyright holder'),
    'Museum trustees',
  )
  await userEvent.type(
    screen.getByLabelText('Rights / reproduction statement'),
    'Corrected reproduction credit',
  )
  await userEvent.type(
    screen.getByLabelText('Additional context'),
    'Archive clarification',
  )
  await userEvent.click(screen.getByRole('button', { name: 'Save metadata' }))
  await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1))
  expect(management.update.mock.calls[0][2]).toEqual({
    creator: 'Original photographer',
    sourceInstitution: 'Museum archive',
    copyrightHolder: 'Museum trustees',
    rightsStatement: 'Corrected reproduction credit',
    description: 'Archive clarification',
  })
})

test('previous legacy rights annotations populate the correction form without publication controls', async () => {
  setup({
    media: mediaFixture({
      rightsAnnotated: true,
      creator: 'Archive photographer',
      sourceInstitution: 'Museum',
      rightsStatement: 'Existing rights statement',
    }),
  })
  expect(
    screen.queryByRole('button', { name: 'Publish image' }),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Reject image' }),
  ).not.toBeInTheDocument()
  await userEvent.click(
    screen.getByRole('button', { name: 'Edit image metadata' }),
  )
  expect(screen.getByLabelText('Photographer or creator')).toHaveValue(
    'Archive photographer',
  )
  expect(screen.getByLabelText('Rights / reproduction statement')).toHaveValue(
    'Existing rights statement',
  )
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
})

test('a fresh reject dialog never prefills a reason from a dismissed one', async () => {
  const media = mediaFixture({
    publicationStatus: 'PENDING_REVIEW',
    permissionAttested: true,
    rightsStatement: 'Permission granted',
  })
  setup({ media })
  await userEvent.click(screen.getByRole('button', { name: 'Reject image' }))
  await userEvent.type(
    screen.getByLabelText('Review reason (optional)'),
    'Private note',
  )
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  await waitFor(() =>
    expect(
      screen.queryByLabelText('Review reason (optional)'),
    ).not.toBeInTheDocument(),
  )
  await userEvent.click(screen.getByRole('button', { name: 'Reject image' }))
  expect(screen.getByLabelText('Review reason (optional)')).toHaveValue('')
})
