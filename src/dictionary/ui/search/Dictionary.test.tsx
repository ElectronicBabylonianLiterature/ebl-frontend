import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, withRouter } from 'react-router-dom'
import Promise from 'bluebird'

import SessionContext from 'auth/SessionContext'
import Dictionary from './Dictionary'
import Word from 'dictionary/domain/Word'
import WordService from 'dictionary/application/WordService'
import MemorySession from 'auth/Session'
import { wordFactory } from 'test-support/word-fixtures'

jest.mock('dictionary/application/WordService')

const DictionaryWithRouter = withRouter<any, typeof Dictionary>(Dictionary)

let words: Word[]
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
let session: MemorySession

beforeEach(() => {
  words = wordFactory.buildList(2)
})

describe('Searching for word', () => {
  beforeEach(() => {
    session = new MemorySession(['read:words'])
    wordService.search.mockReturnValue(Promise.resolve(words))
  })

  it('displays result on successfull query', async () => {
    await renderDictionary('/dictionary?query=lemma')
    expect(screen.getByText(words[1].meaning)).toBeInTheDocument()
    expect(screen.getByLabelText('Query')).toHaveValue('lemma')
  })

  it('displays empty search if no query', async () => {
    await renderDictionary('/dictionary')
    expect(screen.getByLabelText('Query')).toHaveValue('')
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
