import Promise from 'bluebird'

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
import { deafaultErrorReporter } from 'ErrorReporterContext'

const text = {
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  chapters: [
    {
      classification: 'Ancient',
      period: 'NB',
      number: 1
    },
    {
      classification: 'Ancient',
      period: 'OB',
      number: 1
    }
  ]
}
const chapter = text.chapters[1]

let apiDriver
let reactDriver

class FakeApi {
  gets = []
  client = {
    fetchJson: (path, authenticate) => {
      const expectation = this.gets.find(entry => entry.path === path && entry.authenticate === authenticate)
      return expectation
        ? Promise.resolve(expectation.response)
        : Promise.reject(new Error(`Unexpected ${authenticate ? 'authenticated' : 'not-authenticated'} GET request: ${path}`))
    }
  }

  expectText (text) {
    this.gets.push({
      path: `/texts/${text.category}.${text.index}`,
      authenticate: true,
      response: text
    })
    return this
  }
}

class AppDriver {
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
    const auth = new Auth(fakeSessionStore, deafaultErrorReporter, auth0Config)
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

beforeEach(async () => {
  apiDriver = new FakeApi().expectText(text)
  reactDriver = new AppDriver(apiDriver.client)
    .withPath(`/corpus/${encodeURIComponent(text.category)}.${encodeURIComponent(text.index)}/${encodeURIComponent(chapter.period + ' ' + chapter.number)}`)
    .withSession()
    .render()

  await reactDriver.waitForText(`Edit ${text.name} ${chapter.period} ${chapter.number}`)
})

test('Breadcrumbs', async () => {
  reactDriver.expectBreadcrumbs([
    'eBL',
    'Corpus',
    `${text.category}.${text.index}`,
    `${chapter.period} ${chapter.number}`
  ])
})

test.each([
  ['Classification', 'classification'],
  ['Period', 'period'],
  ['Number', 'number']
])('%s', (label, property) => {
  reactDriver.expectInputElement(label, chapter[property])
})
