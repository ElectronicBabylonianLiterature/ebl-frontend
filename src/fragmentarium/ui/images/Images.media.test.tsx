import React from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import Images from 'fragmentarium/ui/images/Images'
import { MediaGalleryContext } from 'fragmentarium/application/MediaGalleryContext'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  galleryServices,
  imageBlob,
  mediaFixture,
} from 'fragmentarium/ui/images/gallery.testSupport'
import { UnsupportedMediaResponseError } from 'fragmentarium/application/MediaRepository'
import { ApiError } from 'http/ApiClient'

jest.mock('exif-js', () => ({ getData: jest.fn(), getTag: jest.fn() }))
global.ResizeObserver = ResizeObserver
const fragmentService = {
  findPhoto: jest.fn().mockResolvedValue(imageBlob),
  findFolio: jest.fn(),
  folioPager: jest.fn(),
}

beforeEach(() => {
  fragmentService.findPhoto.mockResolvedValue(imageBlob)
  jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:image')
  jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
})

function galleryElement(
  fragment = fragmentFactory.build({ number: 'K.1', hasPhoto: true }),
  services = galleryServices(),
): JSX.Element {
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

test('shows migrated media through the production Images component', async () => {
  const services = galleryServices()
  render(galleryElement(undefined, services))
  expect(await screen.findByRole('tab', { name: 'Images' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  expect(await screen.findByAltText('Fragment K.1')).toBeVisible()
  expect(fragmentService.findPhoto).not.toHaveBeenCalled()
})

test('keeps legacy photo access when no new records exist', async () => {
  render(galleryElement(undefined, galleryServices([])))
  expect(await screen.findByAltText('Fragment K.1')).toBeVisible()
  expect(fragmentService.findPhoto).toHaveBeenCalledWith(
    expect.objectContaining({ number: 'K.1' }),
    expect.any(AbortSignal),
  )
})

test.each([401, 403])(
  'does not fall back to legacy after HTTP %s',
  async (status) => {
    const services = galleryServices()
    services.repository.findByFragment.mockRejectedValue(
      new ApiError('Media access denied', {}, status),
    )
    render(galleryElement(undefined, services))
    expect(await screen.findByText('Media access denied')).toBeVisible()
    expect(fragmentService.findPhoto).not.toHaveBeenCalled()
    expect(services.binaryLoader.fetch).not.toHaveBeenCalled()
  },
)

test.each(['PHOTO', 'COPY'] as const)(
  'shows a new-only %s with legacy hasPhoto=false',
  async (type) => {
    const fragment = fragmentFactory.build({
      number: 'K.2',
      hasPhoto: false,
      mediaSummary: { count: 1, types: [type] },
    })
    render(galleryElement(fragment, galleryServices([mediaFixture({ type })])))
    expect(await screen.findByRole('tab', { name: 'Images' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(await screen.findByAltText('Fragment K.2')).toBeVisible()
    expect(fragmentService.findPhoto).not.toHaveBeenCalled()
  },
)

test('reports empty new-only media without invoking a nonexistent legacy photo', async () => {
  const fragment = fragmentFactory.build({
    hasPhoto: false,
    mediaSummary: { count: 1, types: ['COPY'] },
  })
  render(galleryElement(fragment, galleryServices([])))
  expect(await screen.findByText('No images available.')).toBeVisible()
  expect(fragmentService.findPhoto).not.toHaveBeenCalled()
})

test('drops the previous session gallery immediately when the service scope changes', async () => {
  const first = {
    ...galleryServices([mediaFixture({ caption: 'Private original' })]),
    sessionKey: 'first',
  }
  const second = { ...galleryServices(), sessionKey: 'second' }
  second.repository.findByFragment.mockReturnValue(new Promise(() => undefined))
  const { rerender } = render(galleryElement(undefined, first))
  await screen.findByAltText('Private original')
  rerender(galleryElement(undefined, second))
  expect(screen.queryByAltText('Private original')).not.toBeInTheDocument()
  await waitFor(() =>
    expect(second.repository.findByFragment).toHaveBeenCalled(),
  )
})

test('keeps legacy photographs selectable alongside a migrated copy', async () => {
  const fragment = fragmentFactory.build({
    number: 'K.1',
    hasPhoto: true,
    legacyHasPhoto: true,
  })
  render(
    galleryElement(fragment, galleryServices([mediaFixture({ type: 'COPY' })])),
  )
  await screen.findByAltText('Fragment K.1')
  expect(fragmentService.findPhoto).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: 'Legacy photo' }))
  expect(await screen.findByAltText('Fragment K.1')).toBeVisible()
  expect(fragmentService.findPhoto).toHaveBeenCalledTimes(1)
  await userEvent.click(screen.getByRole('button', { name: 'Copy 1' }))
  expect(await screen.findByRole('button', { name: 'Copy 1' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('does not offer a legacy photo for a new-only photo', async () => {
  const fragment = fragmentFactory.build({
    hasPhoto: true,
    legacyHasPhoto: false,
  })
  render(galleryElement(fragment))
  await screen.findByAltText(`Fragment ${fragment.number}`)
  expect(
    screen.queryByRole('button', { name: 'Legacy photo' }),
  ).not.toBeInTheDocument()
})

test('does not request new-only photos through the legacy endpoint with gallery disabled', () => {
  const fragment = fragmentFactory.build({
    hasPhoto: true,
    legacyHasPhoto: false,
    folios: [],
    cdliImages: [],
    mediaSummary: { count: 1, types: ['PHOTO'] },
  })
  render(
    <MemoryRouter>
      <Images
        fragment={fragment}
        fragmentService={fragmentService}
        tab={null}
        activeFolio={null}
      />
    </MemoryRouter>,
  )
  expect(screen.queryByRole('tab', { name: 'Photo' })).not.toBeInTheDocument()
  expect(fragmentService.findPhoto).not.toHaveBeenCalled()
})

test('keeps unsupported response diagnostics and an explicit legacy choice', async () => {
  const services = galleryServices()
  services.repository.findByFragment.mockRejectedValue(
    new UnsupportedMediaResponseError('Unsupported media response'),
  )
  render(galleryElement(undefined, services))
  expect(await screen.findByText('Unsupported media response')).toBeVisible()
  expect(fragmentService.findPhoto).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: 'Legacy photo' }))
  expect(await screen.findByAltText('Fragment K.1')).toBeVisible()
  expect(fragmentService.findPhoto).toHaveBeenCalledTimes(1)
})

test.each([undefined, { count: 0, types: [] }])(
  'does not request images when the fragment has no available media: %p',
  (mediaSummary) => {
    const services = galleryServices([])
    render(
      galleryElement(
        fragmentFactory.build({
          hasPhoto: false,
          mediaSummary,
          folios: [],
          cdliImages: [],
        }),
        services,
      ),
    )
    expect(
      screen.queryByRole('tab', { name: 'Images' }),
    ).not.toBeInTheDocument()
    expect(services.repository.findByFragment).not.toHaveBeenCalled()
    expect(fragmentService.findPhoto).not.toHaveBeenCalled()
  },
)
