import React from 'react'
import {render, cleanup} from 'react-testing-library'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import Auth from './auth0/Auth'

afterEach(cleanup)

const routes = ['/', 'dictionary', '/dictionary/object_id', '/fragmentarium', '/fragmentarium/fragment_number', '/callback']

routes.forEach(route => {
  it(`${route} renders without crashing`, () => {
    localStorage.getItem.mockReturnValue(null)

    render(<MemoryRouter initialEntries={[route]}><App auth={new Auth()} /></MemoryRouter>)
  })
})
