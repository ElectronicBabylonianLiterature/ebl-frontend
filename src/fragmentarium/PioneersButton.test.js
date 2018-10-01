import React from 'react'
import { Router } from 'react-router-dom'
import createMemoryHistory from 'history/createMemoryHistory'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import { whenClicked } from 'testHelpers'
import PioneersButton from './PioneersButton'

let fragmentService
let element
let history

beforeEach(async () => {
  fragmentService = {
    interesting: jest.fn(),
    isAllowedToTransliterate: jest.fn()
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
    .toHaveBeenCalledWith(`/fragmentarium/${fragment._id}`)
})

it('Hides button if user does not have transliteration rights', async () => {
  renderPioneersButton(false)
  expect(element.container.textContent).toEqual('')
})

function renderPioneersButton (isAllowedTo) {
  fragmentService.isAllowedToTransliterate.mockReturnValue(isAllowedTo)
  element = render(<Router history={history}>
    <PioneersButton fragmentService={fragmentService} />
  </Router>)
}
