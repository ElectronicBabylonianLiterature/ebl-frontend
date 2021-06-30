import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Promise } from 'bluebird'
import FolioPager from './FolioPager'
import {
  folioPagerFactory,
  fragmentFactory,
} from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import { FolioPagerData } from 'fragmentarium/domain/pager'

let fragmentService
let element: RenderResult
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
  element = render(
    <MemoryRouter>
      <FolioPager
        fragmentService={fragmentService}
        folio={folio}
        fragmentNumber={fragment.number}
      />
    </MemoryRouter>
  )
  await element.findByText(/Browse/)
})

it('Previous links to the previous fragment', () => {
  expect(
    element.getByLabelText(`Previous ${folio.humanizedName}'s Folio`)
  ).toHaveAttribute('href', expectedLink(pagerData.previous))
})

it('Next links to the next fragment', () => {
  expect(
    element.getByLabelText(`Next ${folio.humanizedName}'s Folio`)
  ).toHaveAttribute('href', expectedLink(pagerData.next))
})

it('Renders title', () => {
  expect(element.container).toHaveTextContent(
    `Browse ${folio.humanizedName}'s Folios`
  )
})

function expectedLink(pagerEntry) {
  const encodedNumber = encodeURIComponent(pagerEntry.fragmentNumber)
  const encodedFolioName = encodeURIComponent(folio.name)
  const encodedFolioNumber = encodeURIComponent(pagerEntry.folioNumber)
  return `/fragmentarium/${encodedNumber}?folioName=${encodedFolioName}&folioNumber=${encodedFolioNumber}&tab=folio`
}
