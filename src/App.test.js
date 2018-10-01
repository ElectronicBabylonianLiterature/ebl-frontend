import React from 'react'
import { render } from 'react-testing-library'
import { MemoryRouter } from 'react-router-dom'
import { factory } from 'factory-girl'
import App from './App'
import Auth from './auth/Auth'
import ApiClient from 'http/ApiClient'
import WordRepository from 'dictionary/WordRepository'
import FragmentRepository from 'fragmentarium/FragmentRepository'
import ImageRepository from 'fragmentarium/ImageRepository'
import FragmentService from 'fragmentarium/FragmentService'
import WordService from 'dictionary/WordService'
import SessionStore from './auth/SessionStore'

const routes = ['/', 'dictionary', '/dictionary/object_id', '/fragmentarium', '/fragmentarium/fragment_number', '/callback']

routes.forEach(route => {
  it(`${route} renders without crashing`, () => {
    const auth = new Auth(new SessionStore())
    const apiClient = new ApiClient(auth)
    const wordRepository = new WordRepository(apiClient)
    const fragmentRepository = new FragmentRepository(apiClient)
    const imageRepository = new ImageRepository(apiClient)
    const fragmentService = new FragmentService(auth, fragmentRepository, imageRepository)
    const wordService = new WordService(auth, wordRepository)

    localStorage.getItem.mockReturnValue(null)
    jest.spyOn(fragmentRepository, 'statistics').mockReturnValueOnce(factory.build('statistics'))

    render(<MemoryRouter initialEntries={[route]}>
      <App
        auth={auth}
        wordService={wordService}
        fragmentService={fragmentService}
      />
    </MemoryRouter>)
  })
})
