import React from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FragmentMediaGallery from 'fragmentarium/ui/images/FragmentMediaGallery'
import { galleryServices } from 'fragmentarium/ui/images/gallery.testSupport'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { ApiError } from 'http/ApiError'

test('closing an empty upload dialog returns to the current gallery', async () => {
  const services = {
    ...galleryServices([]),
    canUpload: true,
    management: {
      upload: jest.fn(),
      update: jest.fn(),
      publish: jest.fn(),
      reject: jest.fn(),
      remove: jest.fn(),
      setPrimary: jest.fn(),
    },
  }
  render(
    <FragmentMediaGallery
      fragment={fragmentFactory.build({
        number: 'K.1',
        hasPhoto: false,
        mediaSummary: undefined,
      })}
      services={services}
      fallback={<p>No legacy photo</p>}
    />,
  )
  await userEvent.click(screen.getByRole('button', { name: 'Add first image' }))
  expect(screen.getByRole('dialog')).toBeVisible()
  await userEvent.click(screen.getAllByRole('button', { name: 'Close' })[1])
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(await screen.findByText('No legacy photo')).toBeVisible()
})

test('an access refusal clears gallery data and is surfaced without a historical fallback', async () => {
  const services = galleryServices([])
  services.repository.findByFragment.mockRejectedValue(
    new ApiError('Access denied', {}, 403),
  )
  render(
    <FragmentMediaGallery
      fragment={fragmentFactory.build()}
      services={services}
      fallback={<p>Historical fallback</p>}
    />,
  )
  expect(await screen.findByRole('alert')).toHaveTextContent('Access denied')
  expect(screen.queryByText('Historical fallback')).not.toBeInTheDocument()
})

test.each(['resolve', 'reject'] as const)(
  'a late gallery %s after unmount cannot restore private image state',
  async (outcome) => {
    const services = galleryServices([])
    let settle = (): void => undefined
    services.repository.findByFragment.mockReturnValue(
      new Promise<never[]>((resolve, reject) => {
        settle = () =>
          outcome === 'resolve'
            ? resolve([])
            : reject(new DOMException('Cancelled', 'AbortError'))
      }),
    )
    const { unmount, container } = render(
      <FragmentMediaGallery
        fragment={fragmentFactory.build()}
        services={services}
        fallback={<p>Historical fallback</p>}
      />,
    )
    const signal = services.repository.findByFragment.mock
      .calls[0][1] as AbortSignal
    unmount()
    expect(signal.aborted).toBe(true)
    await act(async () => settle())
    expect(container).toBeEmptyDOMElement()
  },
)
