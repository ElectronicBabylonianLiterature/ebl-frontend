import React from 'react'
import { render } from 'react-testing-library'
import { MemoryRouter } from 'react-router-dom'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import App from './App'
import Auth from './auth/Auth'
import ApiClient from 'http/ApiClient'
import WordRepository from 'dictionary/WordRepository'
import FragmentRepository from 'fragmentarium/FragmentRepository'
import ImageRepository from 'fragmentarium/ImageRepository'
import FragmentService from 'fragmentarium/FragmentService'
import WordService from 'dictionary/WordService'
import SessionStore from './auth/SessionStore'
import BibliographyRepository from 'bibliography/BibliographyRepository'
import BibliographyService from 'bibliography/BibliographyService'
import { deafaultErrorReporter } from 'ErrorReporterContext'

const auth0Config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN,
  clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
  redirectUri: process.env.REACT_APP_AUTH0_REDIRECT_URI,
  returnTo: process.env.REACT_APP_AUTH0_RETURN_TO
}

test.each(
  ['/', '/bibliography', '/bibliography_new', '/bibliography/entry_id', '/dictionary', '/dictionary/object_id', '/corpus', '/fragmentarium', '/fragmentarium/fragment_number', '/callback']
)('%s renders without crashing', route => {
  const auth = new Auth(new SessionStore(), deafaultErrorReporter, auth0Config)
  const apiClient = new ApiClient(auth)
  const wordRepository = new WordRepository(apiClient)
  const fragmentRepository = new FragmentRepository(apiClient)
  const imageRepository = new ImageRepository(apiClient)
  const bibliographyRepository = new BibliographyRepository(apiClient)
  const wordService = new WordService(wordRepository)
  const bibliographyService = new BibliographyService(bibliographyRepository)
  const fragmentService = new FragmentService(auth, fragmentRepository, imageRepository, bibliographyService)

  jest.spyOn(fragmentRepository, 'statistics').mockReturnValue(Promise.resolve(factory.build('statistics')))

  render(<MemoryRouter initialEntries={[route]}>
    <App
      auth={auth}
      wordService={wordService}
      fragmentService={fragmentService}
      bibliographyService={bibliographyService}
    />
  </MemoryRouter>)
})
