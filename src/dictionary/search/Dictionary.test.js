import React from 'react'
import { render, waitForElement } from 'react-testing-library'
import { MemoryRouter, withRouter } from 'react-router-dom'
import Promise from 'bluebird'
import Dictionary from './Dictionary'
import Auth from 'auth0/Auth'
import { factory } from 'factory-girl'

const DictionaryWithRouter = withRouter(Dictionary)

let words
let auth
let wordRepository

beforeEach(async () => {
  words = await factory.buildMany('word', 2)
  fetch.resetMocks()
  auth = new Auth()
  wordRepository = {
    search: jest.fn()
  }
})

describe('Searching for word', () => {
  beforeEach(() => {
    jest.spyOn(auth, 'isAllowedTo').mockReturnValue(true)
    wordRepository.search.mockReturnValueOnce(Promise.resolve(words))
  })

  it('displays result on successfull query', async () => {
    const { getByText } = renderDictionary('/dictionary?query=lemma')

    await waitForElement(() => getByText(words[0].meaning))
    expect(getByText(words[1].meaning)).toBeDefined()
  })

  it('fills in search form query', async () => {
    const { getByLabelText } = renderDictionary('/dictionary?query=lemma')

    expect(getByLabelText('Query').value).toEqual('lemma')
  })

  it('displays empty search if no query', async () => {
    const { getByLabelText } = renderDictionary('/dictionary')

    expect(getByLabelText('Query').value).toEqual('')
  })
})

it('Displays a message if user is not logged in', async () => {
  jest.spyOn(auth, 'isAllowedTo').mockReturnValueOnce(false)

  const { getByText } = renderDictionary('/dictionary')

  expect(getByText('You do not have the rights to access the dictionary.')).toBeDefined()
})

function renderDictionary (path) {
  return render(<MemoryRouter initialEntries={[path]}>
    <DictionaryWithRouter auth={auth} wordRepository={wordRepository} />
  </MemoryRouter>)
}
