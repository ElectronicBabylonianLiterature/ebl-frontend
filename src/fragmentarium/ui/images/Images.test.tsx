import React from 'react'
import { MemoryRouter } from 'react-router'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import Promise from 'bluebird'
import Images from './Images'
import Folio from 'fragmentarium/domain/Folio'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  folioFactory,
  folioPagerFactory,
} from 'test-support/fragment-data-fixtures'
import { FolioPagerData } from 'fragmentarium/domain/pager'

const photoUrl = 'http://example.com/folio.jpg'
const lineArtUrl = 'http://example.com/folio_l.jpg'
const detailLineArtUrl = 'http://example.com/folio_ld.jpg'

let fragment: Fragment
let fragmentService
let folios: Folio[]
let folioPager: FolioPagerData

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
    renderImages()
    await waitForElementToBeRemoved(() => screen.getAllByLabelText('Spinner'))
  })

  it(`Renders folio tabs`, async () => {
    for (const folio of folios) {
      expect(
        await screen.findByText(`${folio.humanizedName} Folio ${folio.number}`)
      ).toBeVisible()
    }
  })

  it(`Renders CDLI tab`, async () => {
    expect(await screen.findByText('CDLI')).toBeVisible()
  })

  it(`Renders photo tab`, async () => {
    expect((await screen.findAllByText('Photo'))[0]).toBeVisible()
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
  renderImages(selected)
  expect(await screen.findByText(selectedTitle)).toHaveAttribute(
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
  renderImages()
  expect(
    await screen.findByAltText(`A photo of the fragment ${fragment.number}`)
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
  renderImages()
  expect(await screen.findByAltText('CDLI Photo')).toBeVisible()
})

test('No photo, folios, CDLI photo', async () => {
  fragment = fragmentFactory.build(
    {
      hasPhoto: false,
    },
    { associations: { folios: [], externalNumbers: { cdliNumber: '' } } }
  )
  fragmentService.fetchCdliInfo.mockReturnValue(
    Promise.resolve({
      photoUrl: null,
      lineArtUrl: null,
      detailLineArtUrl: null,
    })
  )
  renderImages()
  expect(await screen.findByText('No images')).toBeVisible()
})

function renderImages(activeFolio: Folio | null = null) {
  render(
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
