import React from 'react'
import { render } from 'react-testing-library'
import { Router, withRouter } from 'react-router-dom'
import Promise from 'bluebird'
import createMemoryHistory from 'history/createMemoryHistory'
import Callback from './Callback'

const CallbackWithRouter = withRouter(Callback)

let auth
let history

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

    it('Redirects to home', () => {
      expect(history.replace).toHaveBeenCalledWith('/')
    })
  })
})

describe('Error', () => {
  beforeEach(() => {
    auth.handleAuthentication.mockReturnValueOnce(Promise.reject(new Error('error')))
    renderCallback('access_token=token')
  })

  it('Redirects to home', () => {
    expect(history.replace).toHaveBeenCalledWith('/')
  })
})

describe('Hash does not contain token', () => {
  beforeEach(() => renderCallback('no-token'))

  it('Does not handle authentication', () => {
    expect(auth.handleAuthentication).not.toHaveBeenCalled()
  })
})

function renderCallback (hash) {
  history = createMemoryHistory({
    initialEntries: [`/#${hash}`]
  })
  jest.spyOn(history, 'replace')
  render(
    <Router history={history}>
      <CallbackWithRouter auth={auth} />
    </Router>
  )
}
