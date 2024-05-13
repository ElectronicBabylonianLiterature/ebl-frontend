import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import Promise from 'bluebird'

import SignsSearch from 'signs/ui/search/SignsSearch'
import Sign from 'signs/domain/Sign'
import SignService from 'signs/application/SignService'
import Bluebird from 'bluebird'
import { OrderedSignFactory, signFactory } from 'test-support/sign-fixtures'

jest.mock('signs/application/SignService')

let signs: Sign[]
const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()
const orderedSigns = OrderedSignFactory.buildList(2)

const query = {
  value: 'bu',
  subIndex: 1,
  listsName: undefined,
  listsNumber: undefined,
  isIncludeHomophones: undefined,
  isComposite: undefined,
}
async function renderSignSearch(): Promise<void> {
  render(
    <MemoryRouter>
      <SignsSearch signQuery={query} signService={signService} />
    </MemoryRouter>
  )
  await waitForSpinnerToBeRemoved(screen)
}

describe('Display Search Results', () => {
  beforeEach(async () => {
    signs = signFactory.buildList(2)
    signService.search.mockReturnValue(Bluebird.resolve(signs))
    signService.findSignsByOrder.mockReturnValue(Promise.resolve(orderedSigns))
    await renderSignSearch()
    expect(signService.search).toBeCalledWith(query)
  })
  it('Displays results', async () => {
    expect(
      screen.getAllByText(new RegExp(signs[1].name))[0]
    ).toBeInTheDocument()
  })
})
