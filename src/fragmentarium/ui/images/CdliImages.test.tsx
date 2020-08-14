import React from 'react'
import { render, RenderResult, act } from '@testing-library/react'
import Promise from 'bluebird'
import CdliImages from './CdliImages'
import { Fragment } from 'fragmentarium/domain/fragment'

const photoUrl = 'http://example.com/folio.jpg'
const lineArtUrl = 'http://example.com/folio_l.jpg'
const detailLineArtUrl = 'http://example.com/folio_ld.jpg'

let fragment: Fragment
let fragmentService
let element: RenderResult

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
    await renderImages()
  })

  it(`Renders photo`, () => {
    expect(element.queryByText('Photo')).toBeVisible()
  })

  it(`Renders line art`, () => {
    expect(element.queryByText('Line Art')).toBeVisible()
  })

  it(`Renders detail line art`, () => {
    expect(element.queryByText('Detail Line Art')).toBeVisible()
  })
})

test('Broken CDLI photo', async () => {
  fragmentService.fetchCdliInfo.mockReturnValue(
    Promise.resolve({ photoUrl: null, lineArtUrl, detailLineArtUrl })
  )
  await renderImages()
  expect(element.queryByText('Photo')).toBeNull()
})

test('Broken CDLI line art', async () => {
  fragmentService.fetchCdliInfo.mockReturnValue(
    Promise.resolve({ photoUrl, lineArtUrl: null, detailLineArtUrl })
  )
  await renderImages()
  expect(element.queryByText('Line Art')).toBeNull()
})

test('Broken CDLI detail line art', async () => {
  fragmentService.fetchCdliInfo.mockReturnValue(
    Promise.resolve({ photoUrl, lineArtUrl, detailLineArtUrl: null })
  )
  await renderImages()
  expect(element.queryByText('Detail Line Art')).toBeNull()
})

test('All broken', async () => {
  fragmentService.fetchCdliInfo.mockReturnValue(
    Promise.resolve({
      photoUrl: null,
      lineArtUrl: null,
      detailLineArtUrl: null,
    })
  )
  await renderImages()
  expect(element.container).toHaveTextContent('No images')
})

test('Error', async () => {
  fragmentService.fetchCdliInfo.mockReturnValue(Promise.reject('Error'))
  await renderImages()
  expect(element.container).toHaveTextContent('No images')
})

async function renderImages(): Promise<void> {
  await act(async () => {
    element = render(
      <CdliImages fragmentService={fragmentService} fragment={fragment} />
    )
  })
}
