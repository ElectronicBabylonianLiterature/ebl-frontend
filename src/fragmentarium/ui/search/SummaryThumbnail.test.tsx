import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SummaryThumbnail from 'fragmentarium/ui/search/SummaryThumbnail'

const fragmentNumber = 'K.1'

function renderThumbnail(thumbnailPath: string | null, linked = true): void {
  render(
    <MemoryRouter>
      <SummaryThumbnail
        fragmentNumber={fragmentNumber}
        thumbnailPath={thumbnailPath}
        linked={linked}
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

describe('thumbnail navigation parity with the hydrated card', () => {
  const thumbnailPath = `/fragments/${fragmentNumber}/thumbnail/small`

  it('links to the fragment in a new tab', () => {
    renderThumbnail(thumbnailPath)

    const link = screen.getByRole('link')

    expect(link).toHaveAttribute('href', `/library/${fragmentNumber}`)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('wraps the resolved image in the fragment link', () => {
    renderThumbnail(thumbnailPath)

    expect(screen.getByRole('link')).toContainElement(
      screen.getByAltText(`Preview of ${fragmentNumber}`),
    )
    expect(screen.getByAltText(`Preview of ${fragmentNumber}`)).toHaveAttribute(
      'src',
      `http://example.com${thumbnailPath}`,
    )
  })

  it('lazy-loads the image', () => {
    renderThumbnail(thumbnailPath)

    expect(screen.getByAltText(`Preview of ${fragmentNumber}`)).toHaveAttribute(
      'loading',
      'lazy',
    )
  })

  it('renders no anchor when linking is disabled', () => {
    renderThumbnail(thumbnailPath, false)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(
      screen.getByAltText(`Preview of ${fragmentNumber}`),
    ).toBeInTheDocument()
  })
})
