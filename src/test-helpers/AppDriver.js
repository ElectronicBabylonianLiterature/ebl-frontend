import React from 'react'
import { fireEvent, render, waitForElement } from '@testing-library/react'
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
import createAuth0Config from 'auth/createAuth0Config'

function createApp(api, sessionStore) {
  const auth0Config = createAuth0Config()
  const auth = new Auth(sessionStore, defaultErrorReporter, auth0Config)
  const wordRepository = new WordRepository(api)
  const fragmentRepository = new FragmentRepository(api)
  const imageRepository = new ImageRepository(api)
  const bibliographyRepository = new BibliographyRepository(api)
  const wordService = new WordService(wordRepository)
  const bibliographyService = new BibliographyService(bibliographyRepository)
  const fragmentService = new FragmentService(
    fragmentRepository,
    imageRepository,
    bibliographyService
  )
  const textService = new TextService(api)

  return (
    <App
      auth={auth}
      wordService={wordService}
      fragmentService={fragmentService}
      bibliographyService={bibliographyService}
      textService={textService}
    />
  )
}

export default class AppDriver {
  initialEntries = []
  element = null
  session = null

  constructor(api) {
    this.api = api
  }

  withPath(path) {
    this.initialEntries = [path]
    return this
  }

  withSession() {
    this.session = new Session(
      'accessToken',
      'idToken',
      Number.MAX_SAFE_INTEGER,
      ['write:texts']
    )
    return this
  }

  render() {
    const fakeSessionStore = {
      setSession: session => {
        this.session = session
      },
      clearSession: () => {
        this.session = null
      },
      getSession: () => this.session || new Session('', '', 0, [])
    }

    this.element = render(
      <MemoryRouter initialEntries={this.initialEntries}>
        {createApp(this.api, fakeSessionStore)}
      </MemoryRouter>
    )

    return this
  }

  async waitForText(text) {
    await waitForElement(() => this.element.getByText(text))
  }

  expectTextContent(text) {
    expect(this.element.container).toHaveTextContent(text)
  }

  expectNotInContent(text) {
    expect(this.element.queryByText(text)).toBeNull()
  }

  expectLink(text, expectedHref) {
    expect(this.element.getByText(text)).toHaveAttribute('href', expectedHref)
  }

  expectBreadcrumbs(crumbs) {
    this.expectTextContent(crumbs.join(''))
  }

  expectInputElement(label, expectedValue) {
    expect(this.element.getByLabelText(label).value).toEqual(
      String(expectedValue)
    )
  }

  changeValueByLabel(label, newValue) {
    const input = this.element.getByLabelText(label)
    fireEvent.change(input, { target: { value: newValue } })
  }

  click(text, n = 0) {
    const clickable = this.element.getAllByText(text)[n]
    fireEvent.click(clickable)
    // await wait()
  }
}
