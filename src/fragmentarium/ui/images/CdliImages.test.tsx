import React from 'react'
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import Promise from 'bluebird'
import CdliImages from './CdliImages'
import { Fragment } from 'fragmentarium/domain/fragment'

const photoUrl = 'http://example.com/folio.jpg'
const lineArtUrl = 'http://example.com/folio_l.jpg'
const detailLineArtUrl = 'http://example.com/folio_ld.jpg'

let fragment: Fragment
let fragmentService

beforeEach(async () => {
  fragmentService = {
    fetchCdliInfo: jest.fn(),
  }
  fragmentService.fetchCdliInfo.mockReturnValue(
    Promise.resolve({ photoUrl, lineArtUrl, detailLineArtUrl })
  )
})

describe('CdliImages', () => {
  beforeEach(async () => {
    renderImages()
    await waitForElementToBeRemoved(() => screen.getByLabelText('Spinner'))
  })

  it(`Renders photo`, async () => {
    expect(await screen.findByText('Photo')).toBeVisible()
  })

  it(`Renders line art`, async () => {
    expect(await screen.findByText('Line Art')).toBeVisible()
  })

  it(`Renders detail line art`, async () => {
    expect(await screen.findByText('Detail Line Art')).toBeVisible()
  })
})

test('Broken CDLI photo', async () => {
  fragmentService.fetchCdliInfo.mockReturnValue(
    Promise.resolve({ photoUrl: null, lineArtUrl, detailLineArtUrl })
  )
  renderImages()
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })
  expect(screen.queryByText('Photo')).not.toBeInTheDocument()
})

test('Broken CDLI line art', async () => {
  fragmentService.fetchCdliInfo.mockReturnValue(
    Promise.resolve({ photoUrl, lineArtUrl: null, detailLineArtUrl })
  )
  renderImages()
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })
  expect(screen.queryByText('Line Art')).not.toBeInTheDocument()
})

test('Broken CDLI detail line art', async () => {
  fragmentService.fetchCdliInfo.mockReturnValue(
    Promise.resolve({ photoUrl, lineArtUrl, detailLineArtUrl: null })
  )
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })
  expect(screen.queryByText('Detail Line Art')).not.toBeInTheDocument()
})

test('All broken', async () => {
  fragmentService.fetchCdliInfo.mockReturnValue(
    Promise.resolve({
      photoUrl: null,
      lineArtUrl: null,
      detailLineArtUrl: null,
    })
  )
  renderImages()
  expect(await screen.findByText('No images')).toBeInTheDocument()
})

test('Error', async () => {
  fragmentService.fetchCdliInfo.mockReturnValue(Promise.reject('Error'))
  renderImages()
  expect(await screen.findByText('No images')).toBeInTheDocument()
})

function renderImages() {
  render(<CdliImages fragmentService={fragmentService} fragment={fragment} />)
}
