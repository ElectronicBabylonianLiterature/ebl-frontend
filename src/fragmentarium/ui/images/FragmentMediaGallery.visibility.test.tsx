import React from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FragmentMediaGallery from './FragmentMediaGallery'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { galleryServices, mediaFixture } from './gallery.testSupport'
import ApiMediaRepository from 'fragmentarium/infrastructure/ApiMediaRepository'
import { ApiError } from 'http/ApiClient'

global.ResizeObserver = ResizeObserver
const fragment = fragmentFactory.build({
  number: 'K.1',
  hasPhoto: true,
  legacyHasPhoto: true,
})
const fallback = <p>Historical photograph fallback</p>
beforeEach(() => {
  jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:visibility')
  jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
})
function servicesFor(response: unknown) {
  const fetchJson = jest.fn().mockResolvedValue(response)
  return {
    ...galleryServices([]),
    repository: new ApiMediaRepository({ fetchJson }),
    fetchJson,
  }
}

test('canonical removal suppresses legacy fallback even when fragment summary still says a photograph exists', async () => {
  const services = servicesFor({ media: [], legacyFallbackAllowed: false })
  const { unmount } = render(
    <FragmentMediaGallery
      fragment={fragment}
      services={services}
      fallback={fallback}
    />,
  )
  expect(await screen.findByText('No images available.')).toBeVisible()
  expect(
    screen.queryByText('Historical photograph fallback'),
  ).not.toBeInTheDocument()
  unmount()
  render(
    <FragmentMediaGallery
      fragment={fragment}
      services={services}
      fallback={fallback}
    />,
  )
  expect(await screen.findByText('No images available.')).toBeVisible()
  expect(
    screen.queryByText('Historical photograph fallback'),
  ).not.toBeInTheDocument()
})

test('a remaining canonical image does not make a removed historical image selectable', async () => {
  const services = servicesFor({
    media: [mediaFixture({ caption: 'Remaining photograph' })],
    legacyFallbackAllowed: false,
  })
  render(
    <FragmentMediaGallery
      fragment={fragment}
      services={services}
      fallback={fallback}
    />,
  )
  expect(await screen.findByAltText('Remaining photograph')).toBeVisible()
  expect(
    screen.queryByRole('button', { name: 'Legacy photo' }),
  ).not.toBeInTheDocument()
})

test('successful removal refreshes visibility before any historical fallback can reappear', async () => {
  const media = mediaFixture({ caption: 'Remove this photograph' })
  const services = servicesFor({ media: [media], legacyFallbackAllowed: false })
  services.fetchJson
    .mockResolvedValueOnce({ media: [media], legacyFallbackAllowed: false })
    .mockResolvedValue({ media: [], legacyFallbackAllowed: false })
  const managerServices = {
    ...services,
    canManage: true,
    management: {
      upload: jest.fn(),
      update: jest.fn(),
      publish: jest.fn(),
      reject: jest.fn(),
      setPrimary: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
    },
  }
  render(
    <FragmentMediaGallery
      fragment={fragment}
      services={managerServices}
      fallback={fallback}
    />,
  )
  await screen.findByAltText('Remove this photograph')
  await userEvent.click(screen.getByRole('button', { name: 'Remove image' }))
  await userEvent.click(screen.getByRole('button', { name: 'Confirm removal' }))
  expect(await screen.findByText('No images available.')).toBeVisible()
  expect(
    screen.queryByText('Historical photograph fallback'),
  ).not.toBeInTheDocument()
  await waitFor(() => expect(services.fetchJson).toHaveBeenCalledTimes(2))
})

test('absent visibility flag keeps an unmigrated historical photograph available', async () => {
  render(
    <FragmentMediaGallery
      fragment={fragment}
      services={servicesFor({ media: [] })}
      fallback={fallback}
    />,
  )
  expect(
    await screen.findByText('Historical photograph fallback'),
  ).toBeVisible()
})

test('read-only gallery fallback after a disabled management endpoint retains removal visibility', async () => {
  const fetchJson = jest
    .fn()
    .mockRejectedValueOnce(new ApiError('Writes disabled', {}, 404))
    .mockResolvedValueOnce({
      media: [mediaFixture({ caption: 'Published photograph' })],
      legacyFallbackAllowed: false,
    })
  const services = {
    ...galleryServices([]),
    repository: new ApiMediaRepository({ fetchJson }, true),
  }
  render(
    <FragmentMediaGallery
      fragment={fragment}
      services={services}
      fallback={fallback}
    />,
  )
  expect(await screen.findByAltText('Published photograph')).toBeVisible()
  expect(
    screen.queryByRole('button', { name: 'Legacy photo' }),
  ).not.toBeInTheDocument()
})

test.each([
  { media: [], legacyFallbackAllowed: 'false' },
  { media: null, legacyFallbackAllowed: false },
  {
    media: [{ ...mediaFixture(), representations: {} }],
    legacyFallbackAllowed: false,
  },
])(
  'unreadable responses cannot erase the canonical instruction to suppress historical fallback: %p',
  async (response) => {
    render(
      <FragmentMediaGallery
        fragment={fragment}
        services={servicesFor(response)}
        fallback={fallback}
      />,
    )
    expect(await screen.findByRole('alert')).toBeVisible()
    expect(
      screen.queryByRole('button', { name: 'Legacy photo' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Historical photograph fallback'),
    ).not.toBeInTheDocument()
  },
)

test('unsupported historical responses without a visibility decision retain the explicit legacy choice', async () => {
  render(
    <FragmentMediaGallery
      fragment={fragment}
      services={servicesFor({
        media: [{ ...mediaFixture(), representations: {} }],
      })}
      fallback={fallback}
    />,
  )
  expect(await screen.findByRole('alert')).toBeVisible()
  await userEvent.click(screen.getByRole('button', { name: 'Legacy photo' }))
  expect(screen.getByText('Historical photograph fallback')).toBeVisible()
})
