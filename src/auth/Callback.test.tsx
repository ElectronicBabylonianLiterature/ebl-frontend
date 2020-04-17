import React from 'react'
import { render, wait } from '@testing-library/react'
import { MemoryRouter, withRouter, Switch, Route } from 'react-router-dom'
import Promise from 'bluebird'
import ErrorReporterContext from 'ErrorReporterContext'
import Callback from './Callback'

const CallbackWithRouter = withRouter<any, any>(Callback)

let auth
let element
let errorReportingService

beforeEach(() => {
  auth = {
    handleAuthentication: jest.fn(),
  }
  errorReportingService = {
    captureException: jest.fn(),
  }
})

const keys = ['access_token', 'id_token', 'error']

keys.forEach((key) => {
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
  const error = new Error('error')

  beforeEach(() => {
    auth.handleAuthentication.mockReturnValueOnce(Promise.reject(error))
    renderCallback('access_token=token')
  })

  it('Reports error', async () => {
    await wait(() =>
      expect(errorReportingService.captureException).toHaveBeenCalledWith(error)
    )
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

function itRedirectsToHome(): void {
  it('Redirects to home', async () => {
    await element.findByText('Home')
  })
}

function renderCallback(hash): void {
  element = render(
    <ErrorReporterContext.Provider value={errorReportingService}>
      <MemoryRouter initialEntries={[`/callback#${hash}`]}>
        <Switch>
          <Route
            path="/callback"
            render={(): JSX.Element => <CallbackWithRouter auth={auth} />}
          />
          <Route path="/" render={(): JSX.Element => <div>Home</div>} />
        </Switch>
      </MemoryRouter>
    </ErrorReporterContext.Provider>
  )
}
