import React from 'react'
import ReactDOM from 'react-dom'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import Auth from './auth0/Auth'

it('renders without crashing', () => {
  const auth = new Auth()
  const div = document.createElement('div')

  localStorage.getItem.mockReturnValueOnce(null)

  ReactDOM.render(<MemoryRouter><App auth={auth} /></MemoryRouter>, div)
  ReactDOM.unmountComponentAtNode(div)
})
