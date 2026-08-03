import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SummaryThumbnail from './SummaryThumbnail'

const fragmentNumber = 'K.1'

function renderThumbnail(thumbnailPath: string | null): void {
  render(
    <MemoryRouter>
      <SummaryThumbnail
        fragmentNumber={fragmentNumber}
        thumbnailPath={thumbnailPath}
      />
    </MemoryRouter>,
  )
}

test('renders nothing when no thumbnail path is provided', () => {
  renderThumbnail(null)

  expect(
    screen.queryByAltText(`Preview of ${fragmentNumber}`),
  ).not.toBeInTheDocument()
})

test('renders the thumbnail image when a thumbnail path is provided', () => {
  const thumbnailPath = '/images/summary-thumbnail.jpg'
  renderThumbnail(thumbnailPath)

  expect(screen.getByAltText(`Preview of ${fragmentNumber}`)).toHaveAttribute(
    'src',
    thumbnailPath,
  )
})

test('hides the image after it fails to load', () => {
  renderThumbnail('/images/broken-thumbnail.jpg')

  fireEvent.error(screen.getByAltText(`Preview of ${fragmentNumber}`))

  expect(
    screen.queryByAltText(`Preview of ${fragmentNumber}`),
  ).not.toBeInTheDocument()
})
