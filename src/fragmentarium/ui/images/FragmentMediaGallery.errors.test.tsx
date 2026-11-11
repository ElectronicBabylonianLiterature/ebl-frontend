import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FragmentMediaGallery from 'fragmentarium/ui/images/FragmentMediaGallery'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { galleryServices } from 'fragmentarium/ui/images/gallery.testSupport'
import { ApiError } from 'http/ApiClient'

const LegacyPhoto = jest.fn<JSX.Element, []>()

beforeEach(() => LegacyPhoto.mockImplementation(() => <p>Legacy image</p>))

function renderFailure(
  error: Error,
  hasLegacyPhoto = true,
): RenderResult & {
  services: ReturnType<typeof galleryServices>
  element: (sessionServices?: ReturnType<typeof galleryServices>) => JSX.Element
} {
  const services = galleryServices()
  services.repository.findByFragment.mockRejectedValue(error)
  const fragment = fragmentFactory.build({
    number: 'K.1',
    hasPhoto: true,
    legacyHasPhoto: hasLegacyPhoto,
  })
  const element = (sessionServices = services): JSX.Element => (
    <FragmentMediaGallery
      fragment={fragment}
      services={sessionServices}
      fallback={<LegacyPhoto />}
    />
  )
  return { ...render(element()), services, element }
}

test.each([500, 503])(
  'offers an explicit lazy legacy choice during HTTP %s while retaining retry',
  async (status) => {
    const { services } = renderFailure(
      new ApiError('Media unavailable', {}, status),
    )
    expect(await screen.findByText('Media unavailable')).toBeVisible()
    expect(LegacyPhoto).not.toHaveBeenCalled()
    expect(services.binaryLoader.fetch).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Legacy photo' }))

    expect(screen.getByText('Legacy image')).toBeVisible()
    expect(screen.getByText('Media unavailable')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible()
    expect(services.repository.findByFragment).toHaveBeenCalledTimes(1)
  },
)

test('does not offer a legacy choice during a server error for new-only media', async () => {
  renderFailure(new ApiError('Media unavailable', {}, 500), false)

  expect(await screen.findByText('Media unavailable')).toBeVisible()
  expect(
    screen.queryByRole('button', { name: 'Legacy photo' }),
  ).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible()
  expect(LegacyPhoto).not.toHaveBeenCalled()
})

test.each([
  new ApiError('Media access denied', {}, 401),
  new ApiError('Media access denied', {}, 403),
  new ApiError('Missing HTTP status', {}),
  new ApiError('Invalid HTTP status', {}, 600),
  new Error('Network unavailable'),
])('does not offer legacy fallback for %p', async (error) => {
  renderFailure(error)

  expect(await screen.findByText(error.message)).toBeVisible()
  expect(
    screen.queryByRole('button', { name: 'Legacy photo' }),
  ).not.toBeInTheDocument()
  expect(LegacyPhoto).not.toHaveBeenCalled()
})

test('retries a server error and replaces the diagnostic after recovery', async () => {
  const { services } = renderFailure(new ApiError('Media unavailable', {}, 500))
  await screen.findByText('Media unavailable')
  services.repository.findByFragment.mockResolvedValue([])

  await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

  expect(await screen.findByText('Legacy image')).toBeVisible()
  expect(screen.queryByText('Media unavailable')).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Retry' }),
  ).not.toBeInTheDocument()
  expect(services.repository.findByFragment).toHaveBeenCalledTimes(2)
})

test('removes a selected legacy image if a retry denies access', async () => {
  const { services } = renderFailure(new ApiError('Media unavailable', {}, 500))
  await screen.findByText('Media unavailable')
  await userEvent.click(screen.getByRole('button', { name: 'Legacy photo' }))
  expect(screen.getByText('Legacy image')).toBeVisible()
  services.repository.findByFragment.mockRejectedValue(
    new ApiError('Denied', {}, 403),
  )

  await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

  expect(await screen.findByText('Denied')).toBeVisible()
  expect(screen.queryByText('Legacy image')).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Legacy photo' }),
  ).not.toBeInTheDocument()
})

test('removes a selected legacy image when services change to a denied session', async () => {
  const { rerender, element } = renderFailure(
    new ApiError('Media unavailable', {}, 500),
  )
  await screen.findByText('Media unavailable')
  await userEvent.click(screen.getByRole('button', { name: 'Legacy photo' }))
  const denied = galleryServices()
  denied.repository.findByFragment.mockRejectedValue(
    new ApiError('Denied', {}, 401),
  )

  rerender(element(denied))

  expect(await screen.findByText('Denied')).toBeVisible()
  expect(screen.queryByText('Legacy image')).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Legacy photo' }),
  ).not.toBeInTheDocument()
})
