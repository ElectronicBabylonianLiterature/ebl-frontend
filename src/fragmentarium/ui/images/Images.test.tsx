import React from 'react'
import { MemoryRouter } from 'react-router'
import { act, render, RenderResult } from '@testing-library/react'
import Promise from 'bluebird'
import Images from './Images'
import Folio from 'fragmentarium/domain/Folio'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  folioFactory,
  folioPagerFactory,
  fragmentFactory,
} from 'test-support/fragment-fixtures'
import { FolioPagerData } from 'fragmentarium/domain/pager'

const photoUrl = 'http://example.com/folio.jpg'
const lineArtUrl = 'http://example.com/folio_l.jpg'
const detailLineArtUrl = 'http://example.com/folio_ld.jpg'

let fragment: Fragment
let fragmentService
let folios: Folio[]
let folioPager: FolioPagerData
let element: RenderResult

beforeEach(() => {
  fragmentService = {
    findFolio: jest.fn(),
    findPhoto: jest.fn(),
    folioPager: jest.fn(),
    fetchCdliInfo: jest.fn(),
  }
  folioPager = folioPagerFactory.build()
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
    folios = folioFactory.buildList(3)
    fragment = fragmentFactory.build(
      {
        hasPhoto: true,
      },
      { associations: { folios: folios } }
    )
    await renderImages()
  })

  it(`Renders folio tabs`, () => {
    for (const folio of folios) {
      expect(
        element.getByText(`${folio.humanizedName} Folio ${folio.number}`)
      ).toBeVisible()
    }
  })

  it(`Renders CDLI tab`, () => {
    expect(element.getByText('CDLI')).toBeVisible()
  })

  it(`Renders photo tab`, () => {
    expect(element.getAllByText('Photo')[0]).toBeVisible()
  })
})

it('Displays selected folio', async () => {
  folios = [
    folioFactory.build({ name: 'WGL' }),
    folioFactory.build({ name: 'AKG' }),
  ]
  fragment = fragmentFactory.build({}, { associations: { folios: folios } })
  const selected = folios[0]
  const selectedTitle = `${selected.humanizedName} Folio ${selected.number}`
  await renderImages(selected)
  expect(element.getByText(selectedTitle)).toHaveAttribute(
    'aria-selected',
    'true'
  )
})

it('Displays photo if no folio specified', async () => {
  folios = [
    folioFactory.build({ name: 'WGL' }),
    folioFactory.build({ name: 'AKG' }),
  ]
  fragment = fragmentFactory.build(
    { hasPhoto: true },
    { associations: { folios: folios } }
  )
  await renderImages()
  expect(
    element.getByAltText(`A photo of the fragment ${fragment.number}`)
  ).toBeVisible()
})

it('Displays CDLI photo if no photo and no folio specified', async () => {
  folios = [
    folioFactory.build({ name: 'WGL' }),
    folioFactory.build({ name: 'AKG' }),
  ]
  fragment = fragmentFactory.build(
    { hasPhoto: false },
    { associations: { folios: folios } }
  )
  await renderImages()
  expect(element.getByAltText('CDLI Photo')).toBeVisible()
})

test('No photo, folios, CDLI photo', async () => {
  fragment = fragmentFactory.build(
    {
      cdliNumber: '',
      hasPhoto: false,
    },
    { associations: { folios: [] } }
  )
  fragmentService.fetchCdliInfo.mockReturnValue(
    Promise.resolve({
      photoUrl: null,
      lineArtUrl: null,
      detailLineArtUrl: null,
    })
  )
  await renderImages()
  expect(element.getByText('No images')).toBeVisible()
})

async function renderImages(activeFolio: Folio | null = null): Promise<void> {
  await act(async () => {
    element = render(
      <MemoryRouter>
        <Images
          fragment={fragment}
          fragmentService={fragmentService}
          activeFolio={activeFolio}
          tab={activeFolio && 'folio'}
        />
      </MemoryRouter>
    )
  })
}
