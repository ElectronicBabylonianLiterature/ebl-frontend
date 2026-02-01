import React from 'react'
import { render, screen, RenderResult } from '@testing-library/react'
import Bluebird from 'bluebird'
import _ from 'lodash'

import SessionContext from 'auth/SessionContext'
import { submitForm } from 'test-support/utils'
import WordEditor from './WordEditor'
import { MemoryRouter } from 'react-router-dom'
import { Route } from 'router/compat'
import Word from 'dictionary/domain/Word'
import { wordFactory } from 'test-support/word-fixtures'

const errorMessage = 'error'
let result: Word
let wordService
let session

beforeEach(async () => {
  result = wordFactory.verb().build()
  session = {
    isAllowedToReadWords: _.stubTrue(),
    isAllowedToWriteWords: jest.fn(),
  }
  wordService = {
    find: jest.fn(),
    update: jest.fn(),
  }
  wordService.find.mockReturnValueOnce(Bluebird.resolve(result))
})

describe('Fecth word', () => {
  it('Queries the word from API', async () => {
    await renderWithRouter()

    expect(wordService.find).toBeCalledWith('id')
  })

  it('Displays result on successfull query', async () => {
    await renderWithRouter()

    expect(screen.getByText(result.lemma.join(' '))).toBeInTheDocument()
  })
})

describe('Update word', () => {
  it('Posts to API on submit', async () => {
    wordService.update.mockReturnValueOnce(Bluebird.resolve(result))
    const { container } = await renderWithRouter()

    await submitForm(container)

    expect(wordService.update).toHaveBeenCalledWith(result)
  })

  it('Displays error message failure', async () => {
    wordService.update.mockImplementationOnce(() =>
      Bluebird.reject(new Error(errorMessage)),
    )
    const { container } = await renderWithRouter()

    await submitForm(container)

    await screen.findByText(errorMessage)
  })

  it('Cancels promise on unmount', async () => {
    const promise = new Bluebird(_.noop)
    jest.spyOn(promise, 'cancel')
    wordService.update.mockReturnValueOnce(promise)
    const { unmount, container } = await renderWithRouter()
    await submitForm(container)
    unmount()
    expect(promise.isCancelled()).toBe(true)
  })
})

describe('User is not allowed to write:words', () => {
  it('The form is disabled', async () => {
    await renderWithRouter(false)
    expect(screen.getByRole('group')).toBeDisabled()
  })
})

async function renderWithRouter(isAllowedTo = true): Promise<RenderResult> {
  session.isAllowedToWriteWords.mockReturnValueOnce(isAllowedTo)

  const view = render(
    <MemoryRouter initialEntries={['/dictionary/id']}>
      <SessionContext.Provider value={session}>
        <Route
          path="/dictionary/:id"
          render={({ match }) => (
            <WordEditor wordService={wordService} id={match.params.id ?? ''} />
          )}
        />
      </SessionContext.Provider>
    </MemoryRouter>,
  )
  await screen.findByText(result.lemma.join(' '))
  return view
}
