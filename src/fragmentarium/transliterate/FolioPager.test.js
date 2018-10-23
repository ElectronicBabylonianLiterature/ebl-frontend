import React from 'react'
import { render, waitForElement } from 'react-testing-library'
import { MemoryRouter } from 'react-router-dom'
import { factory } from 'factory-girl'
import _ from 'lodash'
import { Promise } from 'bluebird'
import FolioPager from './FolioPager'

let fragmentService
let element
let fragment
let folio
let pagerData

beforeEach(async () => {
  fragmentService = {
    folioPager: jest.fn()
  }
  pagerData = await factory.build('folioPager')
  fragmentService.folioPager.mockReturnValueOnce(Promise.resolve(pagerData))
  fragment = await factory.build('fragment')
  folio = _.head(fragment.folios)
  element = render(<MemoryRouter>
    <FolioPager fragmentService={fragmentService}
      folio={folio}
      fragmentNumber={fragment._id} />
  </MemoryRouter>)
  await waitForElement(() => element.getByText(/Browse/))
})

it('Previous links to the previous fragment', () => {
  expect(element.getByLabelText('Previous'))
    .toHaveAttribute('href', `/fragmentarium/${encodeURIComponent(pagerData.previous.fragmentNumber)}`)
})

it('Next links to the next fragment', () => {
  expect(element.getByLabelText('Next'))
    .toHaveAttribute('href', `/fragmentarium/${encodeURIComponent(pagerData.next.fragmentNumber)}`)
})

it('Renders title', () => {
  expect(element.container).toHaveTextContent(`Browse ${folio.humanizedName}'s Folios`)
})
