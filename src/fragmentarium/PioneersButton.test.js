import React from 'react'
import { Router } from 'react-router-dom'
import createMemoryHistory from 'history/createMemoryHistory'
import { render } from 'react-testing-library'
import { whenClicked } from 'testHelpers'
import PioneersButton from './PioneersButton'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'

let auth
let apiClient
let element

function renderPioneersButton (isAllowedTo) {
  const history = createMemoryHistory()
  jest.spyOn(auth, 'isAllowedTo').mockReturnValue(isAllowedTo)
  element = render(<Router history={history}>
    <PioneersButton auth={auth} apiClient={apiClient} />
  </Router>)
}

beforeEach(async () => {
  auth = new Auth()
  apiClient = new ApiClient(auth)
  jest.spyOn(apiClient, 'fetchJson')
})

it('Show intersting fragment when clicked', async () => {
  renderPioneersButton(true)
  await whenClicked(element, 'Path of the Pioneers')
    .expect(apiClient.fetchJson)
    .toHaveBeenCalledWith(`/fragments?interesting=true`, true)
})

it('Hides button if user does not have transliteration rights', async () => {
  renderPioneersButton(false)
  expect(element.container.textContent).toEqual('')
})
