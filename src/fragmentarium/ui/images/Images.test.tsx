import React from 'react'
import { MemoryRouter } from 'react-router'
import { render, waitForElement } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import Images from './Images'

const photoUrl = 'http://example.com/folio.jpg'
const lineArtUrl = 'http://example.com/folio_l.jpg'
const detailLineArtUrl = 'http://example.com/folio_ld.jpg'

let fragment
let fragmentService
let container
let folios
let folioPager

beforeEach(async () => {
  fragmentService = {
    findFolio: jest.fn(),
    findPhoto: jest.fn(),
    folioPager: jest.fn(),
    fetchCdliInfo: jest.fn(),
  }
  folioPager = await factory.build('folioPager')
  ;(URL.createObjectURL as jest.Mock).mockReturnValue('url')
  fragmentService.findFolio.mockReturnValue(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' }))
  )
  fragmentService.findPhoto.mockReturnValue(
    Promise.resolve(new Blob([''], { type: 'image/jpeg' }))
  )
  fragmentService.folioPager.mockReturnValue(Promise.resolve(folioPager))
  fragmentService.fetchCdliInfo.mockReturnValue(
    Promise.resolve({ photoUrl, lineArtUrl, detailLineArtUrl })
  )
})

describe('Images', () => {
  beforeEach(async () => {
    folios = await factory.buildMany('folio', 3)
    fragment = await factory.build('fragment', {
      folios: folios,
      hasPhoto: true,
    })
    const element = renderImages()
    container = element.container
    await waitForElement(() => element.getByText('Photo'))
  })

  it(`Renders folio numbers entries`, () => {
    for (const folio of folios) {
      expect(container).toHaveTextContent(folio.number)
    }
  })

  it(`Renders folio numbers entries`, () => {
    for (const folio of folios) {
      expect(container).toHaveTextContent(
        `${folio.humanizedName} Folio ${folio.number}`
      )
    }
  })

  it(`Renders CDLI photo`, () => {
    expect(container).toHaveTextContent('CDLI Photo')
  })

  it(`Renders CDLI line art`, () => {
    expect(container).toHaveTextContent('CDLI Line Art')
  })

  it(`Renders CDLI detail line art`, () => {
    expect(container).toHaveTextContent('CDLI Detail Line Art')
  })

  it(`Renders photo`, () => {
    expect(container).toHaveTextContent('Photo')
  })
})

it('Displays selected folio', async () => {
  folios = await factory.buildMany('folio', 2, {}, [
    { name: 'WGL' },
    { name: 'AKG' },
  ])
  fragment = await factory.build('fragment', { folios: folios })
  const selected = folios[0]
  const selectedTitle = `${selected.humanizedName} Folio ${selected.number}`
  const element = renderImages(selected)
  await waitForElement(() => element.getByText(selectedTitle))
  expect(
    element.getByText(`${selected.humanizedName} Folio ${selected.number}`)
  ).toHaveAttribute('aria-selected', 'true')
})

it('Displays photo if folio specified', async () => {
  folios = await factory.buildMany('folio', 2, {}, [
    { name: 'WGL' },
    { name: 'AKG' },
  ])
  fragment = await factory.build('fragment', { folios: folios, hasPhoto: true })
  const element = renderImages()
  await waitForElement(() =>
    element.getByAltText(`A photo of the fragment ${fragment.number}`)
  )
})

it('Displays CDLI photo if no photo and no folio specified', async () => {
  folios = await factory.buildMany('folio', 2, {}, [
    { name: 'WGL' },
    { name: 'AKG' },
  ])
  fragment = await factory.build('fragment', {
    folios: folios,
    hasPhoto: false,
  })
  const element = renderImages()
  await waitForElement(() => element.getByAltText('CDLI Photo'))
})

test('No photo, folios, CDLI photo', async () => {
  fragment = await factory.build('fragment', {
    folios: [],
    cdliNumber: '',
    hasPhoto: false,
  })
  fragmentService.fetchCdliInfo.mockReturnValue(
    Promise.resolve({
      photoUrl: null,
      lineArtUrl: null,
      detailLineArtUrl: null,
    })
  )
  const element = renderImages()
  await waitForElement(() => element.getByText('No images'))
})

test('Broken CDLI photo', async () => {
  fragment = await factory.build('fragment', { hasPhoto: true })
  fragmentService.fetchCdliInfo.mockReturnValue(
    Promise.resolve({ photoUrl: null, lineArtUrl, detailLineArtUrl })
  )
  const element = renderImages()
  await waitForElement(() => element.getByText('Photo'))
  expect(element.container).not.toHaveTextContent('CDLI Photo')
})

test('Broken CDLI line art', async () => {
  fragment = await factory.build('fragment', { hasPhoto: true })
  fragmentService.fetchCdliInfo.mockReturnValue(
    Promise.resolve({ photoUrl, lineArtUrl: null, detailLineArtUrl })
  )
  const element = renderImages()
  await waitForElement(() => element.getByText('Photo'))
  expect(element.container).not.toHaveTextContent('CDLI Line Art')
})

test('Broken CDLI detail line art', async () => {
  fragment = await factory.build('fragment', { hasPhoto: true })
  fragmentService.fetchCdliInfo.mockReturnValue(
    Promise.resolve({ photoUrl, lineArtUrl, detailLineArtUrl: null })
  )
  const element = renderImages()
  await waitForElement(() => element.getByText('Photo'))
  expect(element.container).not.toHaveTextContent('CDLI Detail Line Art')
})

function renderImages(activeFolio = null) {
  return render(
    <MemoryRouter>
      <Images
        fragment={fragment}
        fragmentService={fragmentService}
        activeFolio={activeFolio}
        tab={activeFolio && 'folio'}
      />
    </MemoryRouter>
  )
}
