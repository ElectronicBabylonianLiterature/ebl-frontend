import React from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Images from './Images'
import {
  MediaGalleryContext,
  MediaGalleryServices,
} from 'fragmentarium/application/MediaGalleryContext'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { galleryServices, imageBlob, mediaFixture } from './gallery.testSupport'

global.ResizeObserver = ResizeObserver
const fragmentService = {
  findPhoto: jest.fn().mockResolvedValue(imageBlob),
  findFolio: jest.fn(),
  folioPager: jest.fn(),
}
beforeEach(() => {
  jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:gallery-image')
  jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
})

function contributorServices(): MediaGalleryServices {
  return {
    ...galleryServices([]),
    sessionKey: 'contributor',
    canUpload: true,
    canManage: false,
    currentUserId: 'auth0|contributor',
    management: {
      upload: jest.fn(),
      update: jest.fn(),
      setPrimary: jest.fn(),
      publish: jest.fn(),
      reject: jest.fn(),
      remove: jest.fn(),
    },
  }
}
function view(
  services: MediaGalleryServices,
  number = 'K.1',
  hasImage = false,
  cdliImages: string[] = [],
): JSX.Element {
  const fragment = fragmentFactory.build({
    number,
    hasPhoto: false,
    legacyHasPhoto: false,
    folios: [],
    cdliImages,
    mediaSummary: hasImage
      ? { count: 1, types: ['PHOTO'] }
      : { count: 0, types: [] },
  })
  return (
    <MemoryRouter>
      <MediaGalleryContext.Provider value={services}>
        <Images
          fragment={fragment}
          fragmentService={fragmentService}
          tab={null}
          activeFolio={null}
        />
      </MediaGalleryContext.Provider>
    </MemoryRouter>
  )
}

test('an authorized contributor can open uploads from an empty fragment Images tab', async () => {
  render(view(contributorServices()))
  expect(screen.getByRole('tab', { name: 'Images' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  expect(await screen.findByText('No images available.')).toBeVisible()
  await userEvent.click(screen.getByRole('button', { name: 'Add first image' }))
  expect(screen.getByRole('dialog', { name: 'Add images' })).toBeVisible()
  expect(screen.getByText('K.1')).toBeVisible()
  expect(screen.getByLabelText('Choose images or drop them here')).toBeVisible()
})

test('an empty Images tab offered for uploads does not displace other imagery as the default', () => {
  render(view(contributorServices(), 'K.1', false, ['P550449_l.jpg']))
  expect(screen.getByRole('tab', { name: 'CDLI' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  expect(screen.getByRole('tab', { name: 'Images' })).toHaveAttribute(
    'aria-selected',
    'false',
  )
})

test('a fragment with images still opens the Images tab first for contributors', () => {
  render(view(contributorServices(), 'K.1', true, ['P550449_l.jpg']))
  expect(screen.getByRole('tab', { name: 'Images' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})

test('a reader without write permission has no upload controls on an empty fragment', () => {
  const services = galleryServices([])
  render(view(services))
  expect(screen.queryByRole('tab', { name: 'Images' })).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: /Add.*image/ }),
  ).not.toBeInTheDocument()
  expect(services.repository.findByFragment).not.toHaveBeenCalled()
})

test('read-only gallery services retain the image viewer while upload controls are disabled', async () => {
  const services = galleryServices([
    mediaFixture({ caption: 'Published photograph' }),
  ])
  render(view(services, 'K.1', true))
  expect(await screen.findByAltText('Published photograph')).toBeVisible()
  expect(
    screen.queryByRole('button', { name: /Add.*image/ }),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Publish image' }),
  ).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Download' })).toBeVisible()
})

test('switching fragments discards the previous fragment upload dialog', async () => {
  const services = contributorServices()
  const { rerender } = render(view(services))
  await screen.findByText('No images available.')
  await userEvent.click(screen.getByRole('button', { name: 'Add first image' }))
  expect(screen.getByRole('dialog', { name: 'Add images' })).toBeVisible()
  rerender(view(services, 'K.2'))
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  )
  expect(screen.getByRole('button', { name: 'Add first image' })).toBeVisible()
})
