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

let fragmentService
let container
let element

async function renderFragmentView () {
  element = render(
    <MemoryRouter>
      <FragmentView match={match} fragmentService={fragmentService} />
    </MemoryRouter>
  )
  container = element.container
  await wait()
}

beforeEach(async () => {
  fragmentService = {
    find: jest.fn(),
    findFolio: jest.fn(),
    isAllowedToRead: jest.fn(),
    isAllowedToTransliterate: jest.fn()
  }
  URL.createObjectURL.mockReturnValue('url')
  fragmentService.findFolio.mockReturnValue(Promise.resolve(new Blob([''], { type: 'image/jpeg' })))
})

describe('Fragment is loaded', () => {
  let fragment

  beforeEach(async () => {
    fragment = await factory.build('fragment', { _id: fragmentNumber })
    fragmentService.find.mockReturnValueOnce(Promise.resolve(fragment))
    fragmentService.isAllowedToRead.mockReturnValue(true)
    fragmentService.isAllowedToTransliterate.mockReturnValue(true)
    await renderFragmentView()
  })

  it('Queries the Fragmenatrium API with given parameters', async () => {
    expect(fragmentService.find).toBeCalledWith(fragmentNumber)
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
    fragmentService.isAllowedToRead.mockReturnValue(true)
    fragmentService.isAllowedToTransliterate.mockReturnValue(true)
    fragmentService.find.mockReturnValueOnce(Promise.reject(new Error(message)))
    await renderFragmentView()
  })

  it('Shows the fragment number', async () => {
    expect(container).toHaveTextContent(fragmentNumber)
  })
})

it('Displays a message if user is not logged in', async () => {
  fragmentService.isAllowedToRead.mockReturnValue(false)
  fragmentService.isAllowedToTransliterate.mockReturnValue(false)
  await renderFragmentView()

  expect(container).toHaveTextContent('You do not have the rights access the fragmentarium.')
})
