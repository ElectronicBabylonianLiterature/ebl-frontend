import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import Promise from 'bluebird'

import { factory } from 'factory-girl'
import SignsSearch from 'signs/ui/search/SignsSearch'
import Sign from 'signs/domain/Sign'
import SignService from 'signs/application/SignService'
import Bluebird from 'bluebird'

jest.mock('signs/application/SignService')

let signs: Sign[]
const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()

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
  await waitForElementToBeRemoved(() => screen.getByLabelText('Spinner'))
}

describe('Display Search Results', () => {
  beforeEach(async () => {
    signs = await factory.buildMany('sign', 2)
    signService.search.mockReturnValue(Bluebird.resolve(signs))
    await renderSignSearch()
    expect(signService.search).toBeCalledWith(query)
  })
  it('Displays results', async () => {
    expect(
      screen.getAllByText(new RegExp(signs[1].name))[0]
    ).toBeInTheDocument()
  })
})
