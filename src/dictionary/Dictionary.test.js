import React from 'react'
import {render, Simulate, wait} from 'react-testing-library'
import Dictionary from './Dictionary'
import Auth from '../auth0/Auth'

let auth

beforeEach(() => {
  fetch.resetMocks()
  auth = new Auth()
})

describe('Searching for word', () => {
  beforeEach(() => {
    jest.spyOn(auth, 'isAuthenticated').mockReturnValue(true)
    jest.spyOn(auth, 'getAccessToken').mockReturnValueOnce('token')
  })

  it('displays result on successfull query', async () => {
    fetch.mockResponseOnce(JSON.stringify({ source: 'source' }))

    const {container, getByText} = render(<Dictionary auth={auth} />)

    Simulate.submit(container.querySelector('form'))
    await wait()
    expect(getByText('source')).toBeDefined()
  })

  it('displays error on failed query', async () => {
    fetch.mockReject(new Error('error'))

    const {container, getByText} = render(<Dictionary auth={auth} />)

    Simulate.submit(container.querySelector('form'))
    await wait()
    expect(getByText('error')).toBeDefined()
  })

  it('displays status text on HTTP error', async () => {
    fetch.mockResponseOnce('', {status: 404, statusText: 'NOT FOUND'})

    const {container, getByText} = render(<Dictionary auth={auth} />)

    Simulate.submit(container.querySelector('form'))
    await wait()
    expect(getByText('NOT FOUND')).toBeDefined()
  })

  it('displays error on if access token is expires', () => {
    jest.spyOn(auth, 'getAccessToken').mockImplementationOnce(() => { throw new Error('error') })

    const {container, getByText} = render(<Dictionary auth={auth} />)

    Simulate.submit(container.querySelector('form'))

    expect(getByText('error')).toBeDefined()
  })
})

it('Displays a message if user is not logged in', () => {
  jest.spyOn(auth, 'isAuthenticated').mockReturnValueOnce(false)

  const {getByText} = render(<Dictionary auth={auth} />)
  expect(getByText('You need to be logged in to access the dictionary.')).toBeDefined()
})
