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
import SignsService from 'signs/application/SignsService'
import Bluebird from 'bluebird'

jest.mock('signs/application/SignsService')

let signs: Sign[]
const signsService = new (SignsService as jest.Mock<
  jest.Mocked<SignsService>
>)()

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
      <SignsSearch signQuery={query} signsService={signsService} />
    </MemoryRouter>
  )
  await waitForElementToBeRemoved(() => screen.getByLabelText('Spinner'))
}

describe('Display Search Results', () => {
  beforeEach(async () => {
    signs = await factory.buildMany('sign', 2)
    signsService.search.mockReturnValue(Bluebird.resolve(signs))
    await renderSignSearch()
    expect(signsService.search).toBeCalledWith(query)
  })
  it('Displays results', async () => {
    expect(screen.getByText(new RegExp(signs[1].name))).toBeInTheDocument()
  })
})
