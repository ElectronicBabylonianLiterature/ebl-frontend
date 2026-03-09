import React from 'react'
import { MemoryRouter } from 'react-router-dom'

import { render } from '@testing-library/react'
import Promise from 'bluebird'
import { whenClicked } from 'test-support/utils'
import SessionContext from 'auth/SessionContext'
import PioneersButton from './PioneersButton'
import { fragmentFactory } from 'test-support/fragment-fixtures'

let fragmentSearchService
let session
let element
const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

beforeEach(async () => {
  fragmentSearchService = {
    interesting: jest.fn(),
  }
  session = {
    isAllowedToTransliterateFragments: jest.fn(),
  }
  mockNavigate.mockReset()
})

it('Redirects to interesting when clicked', async () => {
  renderPioneersButton(true)
  const fragment = fragmentFactory.build()
  fragmentSearchService.interesting.mockReturnValueOnce(
    Promise.resolve(fragment),
  )
  await whenClicked(element, 'Path of the Pioneers')
    .expect(mockNavigate)
    .toHaveBeenCalledWith(`/library/${fragment.number}`)
})

it('Hides button if user does not have transliteration rights', async () => {
  renderPioneersButton(false)
  expect(element.container).toBeEmptyDOMElement()
})

function renderPioneersButton(isAllowedTo) {
  session.isAllowedToTransliterateFragments.mockReturnValue(isAllowedTo)
  element = render(
    <MemoryRouter>
      <SessionContext.Provider value={session}>
        <PioneersButton fragmentSearchService={fragmentSearchService} />
      </SessionContext.Provider>
    </MemoryRouter>,
  )
}
