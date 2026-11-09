import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MediaManagementControls from './MediaManagementControls'
import { galleryServices, mediaFixture } from './gallery.testSupport'
import type { MediaResource } from 'fragmentarium/domain/media'

function setup({
  media = mediaFixture({ publicationStatus: 'PUBLISHED' }),
  manager = true,
  strict = false,
}: {
  media?: MediaResource
  manager?: boolean
  strict?: boolean
} = {}) {
  const management = {
    upload: jest.fn(),
    update: jest.fn().mockResolvedValue(media),
    setPrimary: jest.fn().mockResolvedValue(media),
    publish: jest.fn().mockResolvedValue(media),
    reject: jest.fn().mockResolvedValue(media),
    remove: jest.fn().mockResolvedValue(undefined),
  }
  const services = {
    ...galleryServices([media]),
    canUpload: true,
    canManage: manager,
    currentUserId: 'auth0|owner',
    management,
  }
  const onChanged = jest.fn()
  const component = (
    <MediaManagementControls
      media={media}
      fragmentNumber="K.1"
      services={services}
      onChanged={onChanged}
    />
  )
  const view = render(
    strict ? <React.StrictMode>{component}</React.StrictMode> : component,
  )
  return { ...view, management, onChanged }
}

test('StrictMode replay leaves a live cancellation signal for manager mutations', async () => {
  const { management, onChanged } = setup({ strict: true })
  await userEvent.click(screen.getByRole('button', { name: 'Set as primary' }))
  await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1))
  expect(management.setPrimary).toHaveBeenCalledWith(
    'K.1',
    expect.any(String),
    expect.any(AbortSignal),
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

test('a failed primary change reports the error without refreshing the gallery', async () => {
  const { management, onChanged } = setup()
  management.setPrimary.mockRejectedValueOnce(
    new Error('Primary change denied'),
  )
  await userEvent.click(screen.getByRole('button', { name: 'Set as primary' }))
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Primary change denied',
  )
  expect(onChanged).not.toHaveBeenCalled()
})

test('removal needs confirmation and refreshes only after server success', async () => {
  const { management, onChanged } = setup()
  management.remove.mockRejectedValueOnce(new Error('Removal failed'))
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
    ),
  )
})

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
