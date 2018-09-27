import React from 'react'
import { matchPath } from 'react-router'
import { MemoryRouter } from 'react-router-dom'
import { render, wait } from 'react-testing-library'
import { factory } from 'factory-girl'
import Promise from 'bluebird'
import FragmentView from './FragmentView'

const fragmentNumber = 'K.1'
const match = matchPath(`/fragmentarium/${fragmentNumber}`, {
  path: '/fragmentarium/:id'
})
const message = 'message'

let auth
let imageRepository
let fragmentRepository
let container
let element

async function renderFragmentView () {
  element = render(
    <MemoryRouter>
      <FragmentView match={match} auth={auth} imageRepository={imageRepository} fragmentRepository={fragmentRepository} />
    </MemoryRouter>
  )
  container = element.container
  await wait()
}

beforeEach(async () => {
  auth = {
    isAllowedTo: jest.fn()
  }
  fragmentRepository = {
    find: jest.fn()
  }
  imageRepository = {
    find: jest.fn()
  }
  URL.createObjectURL.mockReturnValue('url')
  imageRepository.find.mockReturnValue(Promise.resolve(new Blob([''], { type: 'image/jpeg' })))
})

describe('Fragment is loaded', () => {
  let fragment

  beforeEach(async () => {
    fragment = await factory.build('fragment', { _id: fragmentNumber })
    fragmentRepository.find.mockReturnValueOnce(Promise.resolve(fragment))
    jest.spyOn(auth, 'isAllowedTo').mockReturnValue(true)
    await renderFragmentView()
  })

  it('Queries the Fragmenatrium API with given parameters', async () => {
    expect(fragmentRepository.find).toBeCalledWith(fragmentNumber)
  })

  it('Shows the fragment number', async () => {
    expect(container).toHaveTextContent(fragmentNumber)
  })

  it('Shows the fragment', async () => {
    expect(container).toHaveTextContent(fragment.transliteration)
  })

  it('Shows pager', () => {
    expect(element.getByLabelText('Next')).toBeVisible()
  })
})

describe('On error', () => {
  beforeEach(async () => {
    jest.spyOn(auth, 'isAllowedTo').mockReturnValue(true)
    fragmentRepository.find.mockReturnValueOnce(Promise.reject(new Error(message)))
    await renderFragmentView()
  })

  it('Shows the fragment number', async () => {
    expect(container).toHaveTextContent(fragmentNumber)
  })
})

it('Displays a message if user is not logged in', async () => {
  jest.spyOn(auth, 'isAllowedTo').mockReturnValue(false)
  await renderFragmentView()

  expect(container).toHaveTextContent('You do not have the rights access the fragmentarium.')
})
