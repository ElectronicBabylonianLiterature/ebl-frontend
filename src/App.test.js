import React from 'react'
import {render, cleanup} from 'react-testing-library'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import Auth from './auth0/Auth'

afterEach(cleanup)

it('renders without crashing', () => {
  localStorage.getItem.mockReturnValue(null)

  render(<MemoryRouter><App auth={new Auth()} /></MemoryRouter>)
})
