import React from 'react'
import {render, fireEvent, wait, cleanup} from 'react-testing-library'
import { MemoryRouter } from 'react-router-dom'
import Dictionary from './Dictionary'
import Auth from '../auth0/Auth'
import HttpClient from '../http/HttpClient'

const words = [
  {
    _id: '1',
    lemma: ['lemma'],
    forms: [],
    homonym: 'I',
    amplifiedMeanings: {},
    derived: []
  },
  {
    _id: '2',
    lemma: ['lemma'],
    forms: [],
    homonym: 'II',
    amplifiedMeanings: {},
    derived: []
  }
]

let auth
let httpClient

afterEach(cleanup)

beforeEach(() => {
  fetch.resetMocks()
  auth = new Auth()
  httpClient = new HttpClient(auth)
})

describe('Searching for word', () => {
  let element

  beforeEach(() => {
    jest.spyOn(auth, 'isAuthenticated').mockReturnValue(true)
    element = render(<MemoryRouter><Dictionary auth={auth} httpClient={httpClient} /></MemoryRouter>)
  })

  it('displays result on successfull query', async () => {
    jest.spyOn(httpClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(words))

    fireEvent.submit(element.container.querySelector('form'))
    await wait()
    expect(element.getByText('lemma')).toBeDefined()
  })

  it('displays error on failed query', async () => {
    const errorMessage = 'error'
    jest.spyOn(httpClient, 'fetchJson').mockReturnValueOnce(Promise.reject(new Error(errorMessage)))

    fireEvent.submit(element.container.querySelector('form'))
    await wait()
    expect(element.getByText(errorMessage)).toBeDefined()
  })
})

it('Displays a message if user is not logged in', () => {
  jest.spyOn(auth, 'isAuthenticated').mockReturnValueOnce(false)

  const {getByText} = render(<Dictionary auth={auth} httpClient={httpClient} />)
  expect(getByText('You need to be logged in to access the dictionary.')).toBeDefined()
})
