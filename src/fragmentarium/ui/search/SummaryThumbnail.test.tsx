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

test('resolves an API-relative thumbnail path against the API base URL', () => {
  renderThumbnail(`/fragments/${fragmentNumber}/thumbnail/small`)

  expect(screen.getByAltText(`Preview of ${fragmentNumber}`)).toHaveAttribute(
    'src',
    `http://example.com/fragments/${fragmentNumber}/thumbnail/small`,
  )
})

test('leaves an absolute thumbnail URL unchanged', () => {
  const thumbnailUrl = 'https://images.example.org/K.1/small.jpg'
  renderThumbnail(thumbnailUrl)

  expect(screen.getByAltText(`Preview of ${fragmentNumber}`)).toHaveAttribute(
    'src',
    thumbnailUrl,
  )
})

test('hides the image after it fails to load', () => {
  renderThumbnail(`/fragments/${fragmentNumber}/thumbnail/small`)

  fireEvent.error(screen.getByAltText(`Preview of ${fragmentNumber}`))

  expect(
    screen.queryByAltText(`Preview of ${fragmentNumber}`),
  ).not.toBeInTheDocument()
})
