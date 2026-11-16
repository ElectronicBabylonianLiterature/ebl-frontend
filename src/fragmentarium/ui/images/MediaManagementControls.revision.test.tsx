import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MediaManagementControls from 'fragmentarium/ui/images/MediaManagementControls'
import { mediaFixture } from 'fragmentarium/ui/images/gallery.testSupport'
import { setup } from 'fragmentarium/ui/images/mediaManagementControls.testSupport'
import { STALE_MEDIA_MESSAGE } from 'fragmentarium/ui/images/mediaManagementOperation'
import { ApiError } from 'http/ApiError'
import React from 'react'

describe('optimistic concurrency', () => {
  const pending = (revision?: number) =>
    mediaFixture({
      publicationStatus: 'PENDING_REVIEW',
      permissionAttested: true,
      rightsStatement: 'Permission granted',
      caption: 'Reviewed caption',
      ...(revision === undefined ? {} : { revision }),
    })

  test('an edit keeps the item and revision from when its dialog was opened', async () => {
    const media = pending(1)
    const { management, onChanged, services, rerender } = setup({ media })
    await userEvent.click(
      screen.getByRole('button', { name: 'Edit image metadata' }),
    )
    await userEvent.type(
      screen.getByLabelText('Additional context'),
      'My correction',
    )
    rerender(
      <MediaManagementControls
        media={{
          ...media,
          revision: 2,
          caption: 'Concurrently updated caption',
          rightsStatement: 'Concurrently corrected rights',
        }}
        fragmentNumber="K.1"
        services={services}
        onChanged={onChanged}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save metadata' }))
    await waitFor(() => expect(management.update).toHaveBeenCalledTimes(1))
    expect(management.update).toHaveBeenCalledWith(
      'K.1',
      media.id,
      { description: 'My correction' },
      expect.any(AbortSignal),
      1,
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Edit image metadata' }),
    )
    expect(screen.getByLabelText('Caption or short description')).toHaveValue(
      'Concurrently updated caption',
    )
    expect(
      screen.getByLabelText('Rights / reproduction statement'),
    ).toHaveValue('Concurrently corrected rights')
  })

  test('a rejection keeps the revision from when its dialog was opened', async () => {
    const media = pending(1)
    const { management, onChanged, services, rerender } = setup({ media })
    await userEvent.click(screen.getByRole('button', { name: 'Reject image' }))
    rerender(
      <MediaManagementControls
        media={{ ...media, revision: 2, caption: 'Concurrently updated image' }}
        fragmentNumber="K.1"
        services={services}
        onChanged={onChanged}
      />,
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Confirm rejection' }),
    )
    await waitFor(() => expect(management.reject).toHaveBeenCalledTimes(1))
    expect(management.reject).toHaveBeenCalledWith(
      'K.1',
      media.id,
      '',
      expect.any(AbortSignal),
      1,
    )
  })

  test('a removal keeps its confirmation text and revision from when its dialog was opened', async () => {
    const media = pending(1)
    const { management, onChanged, services, rerender } = setup({ media })
    await userEvent.click(screen.getByRole('button', { name: 'Remove image' }))
    rerender(
      <MediaManagementControls
        media={{ ...media, revision: 2, caption: 'Concurrently updated image' }}
        fragmentNumber="K.1"
        services={services}
        onChanged={onChanged}
      />,
    )
    expect(screen.getByRole('dialog')).toHaveTextContent('Reviewed caption')
    expect(screen.getByRole('dialog')).not.toHaveTextContent(
      'Concurrently updated image',
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Confirm removal' }),
    )
    await waitFor(() => expect(management.remove).toHaveBeenCalledTimes(1))
    expect(management.remove).toHaveBeenCalledWith(
      'K.1',
      media.id,
      expect.any(AbortSignal),
      1,
    )
  })

  test.each([
    ['PENDING_REVIEW', 'Publish image', 'publish', 4],
    ['PUBLISHED', 'Set as primary', 'setPrimary', 3],
  ] as const)(
    '%s immediate actions use the refreshed displayed revision',
    async (publicationStatus, label, method, revisionIndex) => {
      const media = { ...pending(1), publicationStatus }
      const { management, onChanged, services, rerender } = setup({ media })
      rerender(
        <MediaManagementControls
          media={{ ...media, revision: 2 }}
          fragmentNumber="K.1"
          services={services}
          onChanged={onChanged}
        />,
      )
      await userEvent.click(screen.getByRole('button', { name: label }))
      await waitFor(() => expect(management[method]).toHaveBeenCalledTimes(1))
      expect(management[method].mock.calls[0][revisionIndex]).toBe(2)
    },
  )

  test('every mutation passes the revision of the item as displayed', async () => {
    const media = pending(7)
    const { management, onChanged } = setup({ media })
    await userEvent.click(screen.getByRole('button', { name: 'Publish image' }))
    await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1))
    expect(management.publish).toHaveBeenCalledWith(
      'K.1',
      media.id,
      undefined,
      expect.any(AbortSignal),
      7,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Reject image' }))
    await userEvent.click(
      screen.getByRole('button', { name: 'Confirm rejection' }),
    )
    await waitFor(() => expect(management.reject).toHaveBeenCalledTimes(1))
    expect(management.reject.mock.calls[0][4]).toBe(7)
    await userEvent.click(
      screen.getByRole('button', { name: 'Edit image metadata' }),
    )
    const caption = screen.getByLabelText('Caption or short description')
    await userEvent.clear(caption)
    await userEvent.type(caption, 'Edited')
    await userEvent.click(screen.getByRole('button', { name: 'Save metadata' }))
    await waitFor(() => expect(management.update).toHaveBeenCalledTimes(1))
    expect(management.update.mock.calls[0][4]).toBe(7)
    await userEvent.click(screen.getByRole('button', { name: 'Remove image' }))
    await userEvent.click(
      screen.getByRole('button', { name: 'Confirm removal' }),
    )
    await waitFor(() => expect(management.remove).toHaveBeenCalledTimes(1))
    expect(management.remove.mock.calls[0][3]).toBe(7)
  })

  test('set primary passes the displayed revision', async () => {
    const { management } = setup({
      media: mediaFixture({ publicationStatus: 'PUBLISHED', revision: 2 }),
    })
    await userEvent.click(
      screen.getByRole('button', { name: 'Set as primary' }),
    )
    await waitFor(() => expect(management.setPrimary).toHaveBeenCalledTimes(1))
    expect(management.setPrimary.mock.calls[0][3]).toBe(2)
  })

  test.each([
    [412, 'a stale revision', 3],
    [428, 'a missing revision', undefined],
  ])(
    'a publish refused with HTTP %p (%s) explains the conflict and refreshes the gallery',
    async (status, _name, revision) => {
      const { management, onChanged } = setup({ media: pending(revision) })
      management.publish.mockRejectedValueOnce(
        new ApiError('Precondition Failed', {}, status),
      )
      await userEvent.click(
        screen.getByRole('button', { name: 'Publish image' }),
      )
      expect(await screen.findByRole('alert')).toHaveTextContent(
        STALE_MEDIA_MESSAGE,
      )
      expect(onChanged).toHaveBeenCalledTimes(1)
      expect(management.publish.mock.calls[0][4]).toBe(revision)
    },
  )

  test('a stale rejection closes the outdated dialog, explains the conflict and refreshes', async () => {
    const { management, onChanged } = setup({ media: pending(3) })
    management.reject.mockRejectedValueOnce(
      new ApiError('Precondition Failed', {}, 412),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Reject image' }))
    await userEvent.click(
      screen.getByRole('button', { name: 'Confirm rejection' }),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This image was changed by someone else since you opened it.',
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(onChanged).toHaveBeenCalledTimes(1)
  })
})
