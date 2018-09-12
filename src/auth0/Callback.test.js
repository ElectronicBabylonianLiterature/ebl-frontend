import React from 'react'
import { render, cleanup } from 'react-testing-library'
import { MemoryRouter, Router, withRouter } from 'react-router-dom'
import createMemoryHistory from 'history/createMemoryHistory'
import Callback from './Callback'

const CallbackWithRouter = withRouter(Callback)

let auth
let history

afterEach(cleanup)

beforeEach(() => {
  auth = {
    handleAuthentication: jest.fn()
  }
  history = createMemoryHistory()
})

const keys = ['access_token', 'id_token', 'error']

keys.forEach(key => {
  describe(`Hash contains ${key}`, () => {
    beforeEach(() => {
      history.replace(`/#${key}=token`)
      jest.spyOn(history, 'replace')
      auth.handleAuthentication.mockReturnValueOnce(Promise.resolve())
      render(
        <Router history={history}>
          <CallbackWithRouter auth={auth} />
        </Router>
      )
    })

    it('Handles authentication', () => {
      expect(auth.handleAuthentication).toHaveBeenCalled()
    })
  })
})

describe('Hash does not contain token', () => {
  beforeEach(() => {
    history.replace(`/#no-token`)
    render(
      <MemoryRouter>
        <CallbackWithRouter auth={auth} />
      </MemoryRouter>
    )
  })

  it('Handles authentication', () => {
    expect(auth.handleAuthentication).not.toHaveBeenCalled()
  })
})
