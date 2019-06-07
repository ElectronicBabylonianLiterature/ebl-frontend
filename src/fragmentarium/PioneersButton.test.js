import React from 'react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { render } from '@testing-library/react'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import { whenClicked } from 'test-helpers/utils'
import SessionContext from 'auth/SessionContext'
import PioneersButton from './PioneersButton'

let fragmentService
let session
let element
let history

beforeEach(async () => {
  fragmentService = {
    interesting: jest.fn()
  }
  session = {
    isAllowedToTransliterateFragments: jest.fn()
  }
  history = createMemoryHistory()
  jest.spyOn(history, 'push')
})

it('Redirects to interesting when clicked', async () => {
  renderPioneersButton(true)
  const fragment = await factory.build('fragment')
  fragmentService.interesting.mockReturnValueOnce(Promise.resolve(fragment))
  await whenClicked(element, 'Path of the Pioneers')
    .expect(history.push)
    .toHaveBeenCalledWith(`/fragmentarium/${fragment.number}`)
})

it('Hides button if user does not have transliteration rights', async () => {
  renderPioneersButton(false)
  expect(element.container.textContent).toEqual('')
})

function renderPioneersButton(isAllowedTo) {
  session.isAllowedToTransliterateFragments.mockReturnValue(isAllowedTo)
  element = render(
    <Router history={history}>
      <SessionContext.Provider value={session}>
        <PioneersButton fragmentService={fragmentService} />
      </SessionContext.Provider>
    </Router>
  )
}
