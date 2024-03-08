import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Promise } from 'bluebird'
import FolioPager from './FolioPager'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { folioPagerFactory } from 'test-support/fragment-data-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import { FolioPagerData } from 'fragmentarium/domain/pager'

let fragmentService
let fragment: Fragment
let folio: Folio
let pagerData: FolioPagerData

beforeEach(async () => {
  fragmentService = {
    folioPager: jest.fn(),
  }
  pagerData = folioPagerFactory.build()
  fragmentService.folioPager.mockReturnValueOnce(Promise.resolve(pagerData))
  fragment = fragmentFactory.build()
  folio = fragment.folios[0]
  render(
    <MemoryRouter>
      <FolioPager
        fragmentService={fragmentService}
        folio={folio}
        fragmentNumber={fragment.number}
      />
    </MemoryRouter>
  )
  await screen.findByText(/Browse/)
})

it('Previous links to the previous fragment', () => {
  expect(
    screen.getByLabelText(`Previous ${folio.humanizedName}'s Folio`)
  ).toHaveAttribute('href', expectedLink(pagerData.previous))
})

it('Next links to the next fragment', () => {
  expect(
    screen.getByLabelText(`Next ${folio.humanizedName}'s Folio`)
  ).toHaveAttribute('href', expectedLink(pagerData.next))
})

it('Renders title', () => {
  expect(
    screen.getByText(`Browse ${folio.humanizedName}'s Folios`)
  ).toBeInTheDocument()
})

function expectedLink(pagerEntry) {
  const encodedNumber = encodeURIComponent(pagerEntry.fragmentNumber)
  const encodedFolioName = encodeURIComponent(folio.name)
  const encodedFolioNumber = encodeURIComponent(pagerEntry.folioNumber)
  return `/fragmentarium/${encodedNumber}?folioName=${encodedFolioName}&folioNumber=${encodedFolioNumber}&tab=folio`
}
