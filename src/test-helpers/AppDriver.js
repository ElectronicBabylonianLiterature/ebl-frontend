import React from 'react'
import { render, waitForElement } from 'react-testing-library'
import { MemoryRouter } from 'react-router-dom'
import App from 'App'
import Auth from 'auth/Auth'
import WordRepository from 'dictionary/WordRepository'
import FragmentRepository from 'fragmentarium/FragmentRepository'
import ImageRepository from 'fragmentarium/ImageRepository'
import FragmentService from 'fragmentarium/FragmentService'
import WordService from 'dictionary/WordService'
import TextService from 'corpus/TextService'
import Session from 'auth/Session'
import BibliographyRepository from 'bibliography/BibliographyRepository'
import BibliographyService from 'bibliography/BibliographyService'
import { defaultErrorReporter } from 'ErrorReporterContext'

export default class AppDriver {
  initialEntries = []
  element = null
  session = null

  constructor (api) {
    this.api = api
  }

  withPath (path) {
    this.initialEntries = [path]
    return this
  }

  withSession () {
    this.session = new Session('accessToken', 'idToken', Number.MAX_SAFE_INTEGER, [])
    return this
  }

  render () {
    const auth0Config = {
      domain: process.env.REACT_APP_AUTH0_DOMAIN,
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      redirectUri: process.env.REACT_APP_AUTH0_REDIRECT_URI,
      returnTo: process.env.REACT_APP_AUTH0_RETURN_TO,
      audience: 'dictionary-api'
    }
    const fakeSessionStore = {
      setSession: session => { this.session = session },
      clearSession: () => { this.session = null },
      getSession: () => this.session || new Session('', '', 0, [])
    }
    const auth = new Auth(fakeSessionStore, defaultErrorReporter, auth0Config)
    const wordRepository = new WordRepository(this.api)
    const fragmentRepository = new FragmentRepository(this.api)
    const imageRepository = new ImageRepository(this.api)
    const bibliographyRepository = new BibliographyRepository(this.api)
    const wordService = new WordService(wordRepository)
    const bibliographyService = new BibliographyService(bibliographyRepository)
    const fragmentService = new FragmentService(auth, fragmentRepository, imageRepository, bibliographyService)
    const textService = new TextService(this.api)

    this.element = render(
      <MemoryRouter initialEntries={this.initialEntries}>
        <App
          auth={auth}
          wordService={wordService}
          fragmentService={fragmentService}
          bibliographyService={bibliographyService}
          textService={textService}
        />
      </MemoryRouter>
    )

    return this
  }

  async waitForText (text) {
    await waitForElement(() => this.element.getByText(text))
  }

  expectBreadcrumbs (crumbs) {
    expect(this.element.container).toHaveTextContent(crumbs.join(''))
  }

  expectInputElement (label, expectedValue) {
    expect(this.element.getByLabelText(label).value).toEqual(String(expectedValue))
  }
}
