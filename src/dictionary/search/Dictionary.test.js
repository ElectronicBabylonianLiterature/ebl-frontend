import React from 'react'
import { render, waitForElement } from 'react-testing-library'
import { MemoryRouter, withRouter } from 'react-router-dom'
import Promise from 'bluebird'
import { factory } from 'factory-girl'
import SessionContext from 'auth/SessionContext'
import Dictionary from './Dictionary'

const DictionaryWithRouter = withRouter(Dictionary)

let words
let wordService
let session

beforeEach(async () => {
  words = await factory.buildMany('word', 2)
  wordService = {
    search: jest.fn()
  }
  session = {
    isAllowedToReadWords: jest.fn()
  }
})

describe('Searching for word', () => {
  beforeEach(() => {
    session.isAllowedToReadWords.mockReturnValue(true)
    wordService.search.mockReturnValueOnce(Promise.resolve(words))
  })

  it('displays result on successfull query', async () => {
    const { getByText } = renderDictionary('/dictionary?query=lemma')

    await waitForElement(() => getByText(words[0].meaning))
    expect(getByText(words[1].meaning)).toBeDefined()
  })

  it('fills in search form query', () => {
    const { getByLabelText } = renderDictionary('/dictionary?query=lemma')

    expect(getByLabelText('Query').value).toEqual('lemma')
  })

  it('displays empty search if no query', () => {
    const { getByLabelText } = renderDictionary('/dictionary')

    expect(getByLabelText('Query').value).toEqual('')
  })
})

it('Displays a message if user is not logged in', () => {
  session.isAllowedToReadWords.mockReturnValueOnce(false)

  const { container } = renderDictionary('/dictionary')

  expect(container).toHaveTextContent('Please log in to browse the Dictionary.')
})

function renderDictionary (path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SessionContext.Provider value={session}>
        <DictionaryWithRouter wordService={wordService} />
      </SessionContext.Provider>
    </MemoryRouter>
  )
}
