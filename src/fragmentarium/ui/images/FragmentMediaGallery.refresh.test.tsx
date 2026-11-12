import React from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FragmentMediaGallery from './FragmentMediaGallery'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { galleryServices, mediaFixture } from './gallery.testSupport'
import type { MediaResource } from 'fragmentarium/domain/media'
import { ApiError } from 'http/ApiError'

global.ResizeObserver = ResizeObserver
const fragment = fragmentFactory.build({ number: 'K.1', hasPhoto: true })
const fallback = <p>Historical photograph fallback</p>
const alpha = mediaFixture({
  id: '550e8400-e29b-41d4-a716-446655440001',
  caption: 'Alpha',
  isPrimary: true,
  publicationStatus: 'PUBLISHED',
})
const beta = mediaFixture({
  id: '550e8400-e29b-41d4-a716-446655440002',
  caption: 'Beta',
  sortOrder: 1,
  publicationStatus: 'PUBLISHED',
})
beforeEach(() => {
  jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:refresh')
  jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
})
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
function managerServices(
  findByFragment: jest.Mock,
  setPrimary: jest.Mock = jest.fn(),
) {
  return {
    ...galleryServices([]),
    repository: { findByFragment },
    canUpload: true,
    canManage: true,
    management: {
      upload: jest.fn(),
      update: jest.fn(),
      publish: jest.fn(),
      reject: jest.fn(),
      remove: jest.fn(),
      setPrimary,
    },
  }
}

test('a management refresh keeps the gallery mounted with the selected image and focus', async () => {
  const refreshed = deferred<MediaResource[]>()
  const findByFragment = jest
    .fn()
    .mockResolvedValueOnce([alpha, beta])
    .mockReturnValueOnce(refreshed.promise)
  const setPrimary = jest.fn().mockResolvedValue(beta)
  render(
    <FragmentMediaGallery
      fragment={fragment}
      services={managerServices(findByFragment, setPrimary)}
      fallback={fallback}
    />,
  )
  await userEvent.click(await screen.findByRole('button', { name: /Beta/ }))
  const choose = screen.getByRole('button', { name: /Beta/ })
  choose.focus()
  await userEvent.click(screen.getByRole('button', { name: 'Set as primary' }))
  await waitFor(() => expect(findByFragment).toHaveBeenCalledTimes(2))
  expect(screen.queryByText(/Loading/)).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Beta/ })).toBe(choose)
  expect(choose).toHaveAttribute('aria-pressed', 'true')
  await act(async () =>
    refreshed.resolve([
      { ...alpha, isPrimary: false },
      { ...beta, isPrimary: true },
    ]),
  )
  expect(screen.getByRole('button', { name: /Beta/ })).toBe(choose)
  expect(choose).toHaveAttribute('aria-pressed', 'true')
  expect(
    screen.queryByRole('button', { name: 'Set as primary' }),
  ).not.toBeInTheDocument()
})

test('a failed refresh keeps the current images and offers a retry', async () => {
  const findByFragment = jest
    .fn()
    .mockResolvedValueOnce([alpha, beta])
    .mockRejectedValueOnce(new Error('Refresh failed'))
    .mockResolvedValue([alpha, beta])
  render(
    <FragmentMediaGallery
      fragment={fragment}
      services={managerServices(
        findByFragment,
        jest.fn().mockResolvedValue(beta),
      )}
      fallback={fallback}
    />,
  )
  await userEvent.click(await screen.findByRole('button', { name: /Beta/ }))
  await userEvent.click(screen.getByRole('button', { name: 'Set as primary' }))
  expect(await screen.findByText('Refresh failed')).toBeVisible()
  expect(screen.getByRole('button', { name: /Beta/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('responses for a previous fragment or session are never shown after a switch', async () => {
  const oldFragment = deferred<MediaResource[]>()
  const newFragment = deferred<MediaResource[]>()
  const oldSession = deferred<MediaResource[]>()
  const first = managerServices(jest.fn().mockReturnValue(oldFragment.promise))
  const { rerender } = render(
    <FragmentMediaGallery
      fragment={fragment}
      services={first}
      fallback={fallback}
    />,
  )
  const second = managerServices(jest.fn().mockReturnValue(newFragment.promise))
  rerender(
    <FragmentMediaGallery
      fragment={fragmentFactory.build({ number: 'K.2', hasPhoto: true })}
      services={second}
      fallback={fallback}
    />,
  )
  await act(async () => oldFragment.resolve([alpha]))
  expect(
    screen.queryByRole('button', { name: /Alpha/ }),
  ).not.toBeInTheDocument()
  expect(screen.getByText(/Loading/)).toBeInTheDocument()
  await act(async () =>
    newFragment.resolve([mediaFixture({ caption: 'Other fragment' })]),
  )
  expect(
    await screen.findByRole('button', { name: /Other fragment/ }),
  ).toBeVisible()
  const third = managerServices(jest.fn().mockReturnValue(oldSession.promise))
  rerender(
    <FragmentMediaGallery
      fragment={fragmentFactory.build({ number: 'K.2', hasPhoto: true })}
      services={third}
      fallback={fallback}
    />,
  )
  expect(
    screen.queryByRole('button', { name: /Other fragment/ }),
  ).not.toBeInTheDocument()
  expect(screen.getByText(/Loading/)).toBeInTheDocument()
})

test.each([401, 403])(
  'a definitive %s on refresh purges every previously loaded private image',
  async (status) => {
    const findByFragment = jest
      .fn()
      .mockResolvedValueOnce([alpha, beta])
      .mockRejectedValueOnce(new ApiError('Forbidden', {}, status))
    render(
      <FragmentMediaGallery
        fragment={fragment}
        services={managerServices(
          findByFragment,
          jest.fn().mockResolvedValue(beta),
        )}
        fallback={fallback}
      />,
    )
    await userEvent.click(await screen.findByRole('button', { name: /Beta/ }))
    await userEvent.click(
      screen.getByRole('button', { name: 'Set as primary' }),
    )
    expect(await screen.findByText(/Forbidden/)).toBeVisible()
    expect(
      screen.queryByRole('button', { name: /Alpha/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Beta/ }),
    ).not.toBeInTheDocument()
    expect(screen.queryByAltText('Beta')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: /Images of/ }),
    ).not.toBeInTheDocument()
  },
)

test('a transient server error retains the loaded images', async () => {
  const findByFragment = jest
    .fn()
    .mockResolvedValueOnce([alpha, beta])
    .mockRejectedValueOnce(new ApiError('Server error', {}, 500))
  render(
    <FragmentMediaGallery
      fragment={fragment}
      services={managerServices(
        findByFragment,
        jest.fn().mockResolvedValue(beta),
      )}
      fallback={fallback}
    />,
  )
  await userEvent.click(await screen.findByRole('button', { name: /Beta/ }))
  await userEvent.click(screen.getByRole('button', { name: 'Set as primary' }))
  expect(await screen.findByText(/Server error/)).toBeVisible()
  expect(screen.getByRole('button', { name: /Beta/ })).toBeVisible()
})

test('an error from the previous fragment is not shown for the next one', async () => {
  const next = deferred<MediaResource[]>()
  const services = managerServices(
    jest
      .fn()
      .mockRejectedValueOnce(new ApiError('Old fragment denied', {}, 403))
      .mockReturnValue(next.promise),
  )
  const { rerender } = render(
    <FragmentMediaGallery
      fragment={fragment}
      services={services}
      fallback={fallback}
    />,
  )
  expect(await screen.findByText(/Old fragment denied/)).toBeVisible()
  rerender(
    <FragmentMediaGallery
      fragment={fragmentFactory.build({ number: 'K.2', hasPhoto: true })}
      services={services}
      fallback={fallback}
    />,
  )
  expect(screen.queryByText(/Old fragment denied/)).not.toBeInTheDocument()
  expect(screen.getByText(/Loading/)).toBeInTheDocument()
  await act(async () => next.resolve([]))
})
