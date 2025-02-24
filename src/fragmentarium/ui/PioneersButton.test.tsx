import React from 'react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { render } from '@testing-library/react'
import Promise from 'bluebird'
import { whenClicked } from 'test-support/utils'
import SessionContext from 'auth/SessionContext'
import PioneersButton from './PioneersButton'
import { fragmentFactory } from 'test-support/fragment-fixtures'

let fragmentSearchService
let session
let element
let history

beforeEach(async () => {
  fragmentSearchService = {
    interesting: jest.fn(),
  }
  session = {
    isAllowedToTransliterateFragments: jest.fn(),
  }
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
})

it('Redirects to interesting when clicked', async () => {
  renderPioneersButton(true)
  const fragment = fragmentFactory.build()
  fragmentSearchService.interesting.mockReturnValueOnce(
    Promise.resolve(fragment)
  )
  await whenClicked(element, 'Path of the Pioneers')
    .expect(history.push)
    .toHaveBeenCalledWith(`/library/${fragment.number}`)
})

it('Hides button if user does not have transliteration rights', async () => {
  renderPioneersButton(false)
  expect(element.container).toBeEmptyDOMElement()
})

function renderPioneersButton(isAllowedTo) {
  session.isAllowedToTransliterateFragments.mockReturnValue(isAllowedTo)
  element = render(
    <Router history={history}>
      <SessionContext.Provider value={session}>
        <PioneersButton fragmentSearchService={fragmentSearchService} />
      </SessionContext.Provider>
    </Router>
  )
}
