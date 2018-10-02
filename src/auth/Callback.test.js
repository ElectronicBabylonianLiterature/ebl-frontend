import React from 'react'
import { render } from 'react-testing-library'
import { MemoryRouter, withRouter, Switch, Route } from 'react-router-dom'
import Promise from 'bluebird'
import Callback from './Callback'

const CallbackWithRouter = withRouter(Callback)

let auth
let element

beforeEach(() => {
  auth = {
    handleAuthentication: jest.fn()
  }
})

const keys = ['access_token', 'id_token', 'error']

keys.forEach(key => {
  describe(`Hash contains ${key}`, () => {
    beforeEach(() => {
      auth.handleAuthentication.mockReturnValueOnce(Promise.resolve())
      renderCallback(`${key}=token`)
    })

    it('Handles authentication', () => {
      expect(auth.handleAuthentication).toHaveBeenCalled()
    })

    itRedirectsToHome()
  })
})

describe('Error', () => {
  beforeEach(() => {
    auth.handleAuthentication.mockReturnValueOnce(Promise.reject(new Error('error')))
    renderCallback('access_token=token')
  })

  itRedirectsToHome()
})

describe('Hash does not contain token', () => {
  beforeEach(() => renderCallback('no-token'))

  it('Does not handle authentication', () => {
    expect(auth.handleAuthentication).not.toHaveBeenCalled()
  })

  itRedirectsToHome()
})

function itRedirectsToHome () {
  it('Redirects to home', () => {
    expect(element.container).toHaveTextContent('Home')
  })
}

function renderCallback (hash) {
  element = render(
    <MemoryRouter initialEntries={[`/callback#${hash}`]}>
      <Switch>
        <Route path='/callback' render={() => <CallbackWithRouter auth={auth} />} />
        <Route path='/' render={() => <div>Home</div>} />
      </Switch>
    </MemoryRouter>
  )
}
