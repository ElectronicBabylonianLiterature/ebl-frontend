import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import Promise from 'bluebird'
import { factory } from 'factory-girl'
import SessionContext from 'auth/SessionContext'
import Dictionary from './Dictionary'
import Word from 'dictionary/domain/Word'
import WordService from 'dictionary/application/WordService'
import MemorySession from 'auth/Session'

jest.mock('dictionary/application/WordService')

const DictionaryWithRouter = withRouter<any, typeof Dictionary>(Dictionary)

let words: Word[]
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
let session: MemorySession

beforeEach(async () => {
  words = await factory.buildMany('word', 2)
})

describe('Searching for word', () => {
  beforeEach(() => {
    session = new MemorySession(['read:words'])
    wordService.search.mockReturnValue(Promise.resolve(words))
  })

  it('displays result on successfull query', async () => {
    await renderDictionary('/dictionary?query=lemma')
    expect(screen.getByText(words[1].meaning)).toBeInTheDocument()
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
  session = new MemorySession([])
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
