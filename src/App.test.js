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

test.each(
  ['/', '/bibliography', '/bibliography/entry_id', '/dictionary', '/dictionary/object_id', '/fragmentarium', '/fragmentarium/fragment_number', '/callback']
)('%s renders without crashing', route => {
  const auth = new Auth(new SessionStore())
  const apiClient = new ApiClient(auth)
  const wordRepository = new WordRepository(apiClient)
  const fragmentRepository = new FragmentRepository(apiClient)
  const imageRepository = new ImageRepository(apiClient)
  const bibliographyRepository = new BibliographyRepository(apiClient)
  const fragmentService = new FragmentService(auth, fragmentRepository, imageRepository, bibliographyRepository)
  const wordService = new WordService(wordRepository)

  jest.spyOn(fragmentRepository, 'statistics').mockReturnValue(Promise.resolve(factory.build('statistics')))

  render(<MemoryRouter initialEntries={[route]}>
    <App
      auth={auth}
      wordService={wordService}
      fragmentService={fragmentService}
      bibliographyRepository={bibliographyRepository}
    />
  </MemoryRouter>)
})
