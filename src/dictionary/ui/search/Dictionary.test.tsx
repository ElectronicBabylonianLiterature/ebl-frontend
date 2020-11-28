import React from 'react'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import Promise from 'bluebird'
import { factory } from 'factory-girl'
import SessionContext from 'auth/SessionContext'
import Dictionary from './Dictionary'

const DictionaryWithRouter = withRouter<any, any>(Dictionary)

let words
let wordService
let session

beforeEach(async () => {
  words = await factory.buildMany('word', 2)
  wordService = {
    search: jest.fn(),
  }
  session = {
    isAllowedToReadWords: jest.fn(),
  }
})

describe('Searching for word', () => {
  beforeEach(() => {
    session.isAllowedToReadWords.mockReturnValue(true)
    wordService.search.mockReturnValueOnce(Promise.resolve(words))
  })

  it('displays result on successfull query', async () => {
    await renderDictionary('/dictionary?query=lemma')
    expect(screen.getByText(words[1].meaning)).toBeDefined()
  })

  it('fills in search form query', async () => {
    await renderDictionary('/dictionary?query=lemma')
    expect((screen.getByLabelText('Query') as HTMLInputElement).value).toEqual(
      'lemma'
    )
  })

  it('displays empty search if no query', async () => {
    await renderDictionary('/dictionary')
    expect((screen.getByLabelText('Query') as HTMLInputElement).value).toEqual(
      ''
    )
  })
})

it('Displays a message if user is not logged in', async () => {
  session.isAllowedToReadWords.mockReturnValueOnce(false)
  await renderDictionary('/dictionary')
  expect(
    screen.getByText('Please log in to browse the Dictionary.')
  ).toBeVisible()
})

async function renderDictionary(path: string): Promise<void> {
  render(
    <MemoryRouter initialEntries={[path]}>
      <SessionContext.Provider value={session}>
        <DictionaryWithRouter wordService={wordService} />
      </SessionContext.Provider>
    </MemoryRouter>
  )
  await screen.findAllByText('Dictionary')
}
