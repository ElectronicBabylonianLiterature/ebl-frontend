import React from 'react'
import { act, render, screen } from '@testing-library/react'
import FragmentCardThumbnail from 'fragmentarium/ui/search/FragmentCardThumbnail'
import { MediaGalleryContext } from 'fragmentarium/application/MediaGalleryContext'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  galleryServices,
  imageBlob,
  mediaFixture,
} from 'fragmentarium/ui/images/gallery.testSupport'

beforeEach(() =>
  jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:card'),
)

const queryItem = { museumNumber: 'K.1', matchingLines: [], matchCount: 0 }

test.each([true, false])(
  'preserves legacy binary thumbnails with linked=%s',
  async (linked) => {
    const service = {
      findThumbnail: jest.fn().mockResolvedValue({ blob: imageBlob }),
    }
    render(
      <FragmentCardThumbnail
        fragment={fragmentFactory.build({ number: 'K.1', hasPhoto: true })}
        fragmentService={service}
        queryItem={queryItem}
        linked={linked}
      />,
    )
    expect(await screen.findByAltText('Preview of K.1')).toHaveAttribute(
      'src',
      'blob:card',
    )
    expect(Boolean(screen.queryByRole('link'))).toBe(linked)
  },
)

test('omits a missing legacy thumbnail', async () => {
  const service = { findThumbnail: jest.fn().mockResolvedValue({ blob: null }) }
  const { container } = render(
    <FragmentCardThumbnail
      fragment={fragmentFactory.build({ hasPhoto: true })}
      fragmentService={service}
      queryItem={queryItem}
    />,
  )
  await act(async () => undefined)
  expect(container).toBeEmptyDOMElement()
})

test('does not request legacy bytes for a new-only photo while disabled', () => {
  const service = { findThumbnail: jest.fn() }
  render(
    <FragmentCardThumbnail
      fragment={fragmentFactory.build({
        hasPhoto: true,
        legacyHasPhoto: false,
      })}
      fragmentService={service}
      queryItem={queryItem}
    />,
  )
  expect(service.findThumbnail).not.toHaveBeenCalled()
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
})

test('uses scoped gallery thumbnails for new-only search results', async () => {
  const media = mediaFixture({ type: 'COPY' })
  const services = galleryServices([media])
  const service = { findThumbnail: jest.fn() }
  const fragment = fragmentFactory.build({
    number: 'K.1',
    hasPhoto: false,
    legacyHasPhoto: false,
    mediaSummary: {
      count: 1,
      types: ['COPY'],
      primary: {
        id: media.id,
        type: 'COPY',
        thumbnail: media.representations.thumbnails.small,
      },
    },
  })
  render(
    <MediaGalleryContext.Provider value={services}>
      <FragmentCardThumbnail
        fragment={fragment}
        fragmentService={service}
        queryItem={queryItem}
      />
    </MediaGalleryContext.Provider>,
  )
  expect(await screen.findByAltText('Preview of K.1')).toBeVisible()
  expect(service.findThumbnail).not.toHaveBeenCalled()
  expect(services.binaryLoader.fetch).toHaveBeenCalledTimes(1)
})
