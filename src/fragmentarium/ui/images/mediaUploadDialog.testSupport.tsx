import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type MediaManagementRepository from 'fragmentarium/application/MediaManagementRepository'
import MediaUploadDialog from 'fragmentarium/ui/images/MediaUploadDialog'
import {
  galleryServices,
  mediaFixture,
} from 'fragmentarium/ui/images/gallery.testSupport'
import React from 'react'

export let counter = 0

export function prepareUploadMocks() {
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: {
      getRandomValues: (bytes: Uint8Array) => {
        bytes.fill(0)
        bytes[15] = ++counter
        return bytes
      },
    },
  })
  jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview')
  jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
}

export function setup(
  upload = jest
    .fn()
    .mockResolvedValue(mediaFixture({ publicationStatus: 'PENDING_REVIEW' })),
) {
  const services = {
    ...galleryServices([]),
    canUpload: true,
    management: { upload } as unknown as MediaManagementRepository,
  }
  const onChanged = jest.fn()
  const view = render(
    <MediaUploadDialog
      show
      onHide={jest.fn()}
      fragmentNumber="K.1"
      services={services}
      onChanged={onChanged}
    />,
  )
  return { ...view, upload, onChanged }
}

export const file = (name = 'obverse.png') =>
  new File(['png'], name, { type: 'image/png' })

export async function fill(name = 'obverse.png') {
  const entry = within(screen.getByRole('region', { name: `Upload ${name}` }))
  fireEvent.change(entry.getByLabelText('Caption or short description'), {
    target: { value: 'Obverse' },
  })
  fireEvent.change(entry.getByLabelText('Rights / reproduction statement'), {
    target: { value: 'Permission for eBL reproduction' },
  })
  await userEvent.click(entry.getByRole('checkbox'))
}
export async function fillShared(caption = 'Obverse') {
  fireEvent.change(
    screen.getAllByLabelText('Caption or short description')[0],
    {
      target: { value: caption },
    },
  )
  fireEvent.change(
    screen.getAllByLabelText('Rights / reproduction statement')[0],
    { target: { value: 'Permission for eBL reproduction' } },
  )
  await userEvent.click(screen.getAllByRole('checkbox')[0])
}

export async function submitOne(upload: jest.Mock) {
  await userEvent.upload(
    screen.getByLabelText('Choose images or drop them here'),
    file(),
  )
  await fill()
  await userEvent.click(
    screen.getByRole('button', { name: 'Submit images for review' }),
  )
  await waitFor(() => expect(upload).toHaveBeenCalledTimes(1))
}

export const applyShared = () =>
  userEvent.click(
    screen.getByRole('button', { name: 'Apply to selected images' }),
  )

export const abortable = () =>
  jest.fn(
    (_fragment, _file, _metadata, _key, options) =>
      new Promise((_resolve, reject) =>
        options.signal.addEventListener('abort', () =>
          reject(new DOMException('Cancelled', 'AbortError')),
        ),
      ),
  )

export const pending = () =>
  mediaFixture({ publicationStatus: 'PENDING_REVIEW' })
