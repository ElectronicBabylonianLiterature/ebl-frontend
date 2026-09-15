import React from 'react'
import { render, screen, RenderResult } from '@testing-library/react'
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
  wordService.find.mockReturnValueOnce(Promise.resolve(result))
})

describe('Fecth word', () => {
  it('Queries the word from API', async () => {
    await renderWithRouter()

    expect(wordService.find).toBeCalledWith('id', expect.any(AbortSignal))
  })

  it('Displays result on successfull query', async () => {
    await renderWithRouter()

    expect(screen.getByText(result.lemma.join(' '))).toBeInTheDocument()
  })
})

describe('Update word', () => {
  it('Posts to API on submit', async () => {
    wordService.update.mockReturnValueOnce(Promise.resolve(result))
    const { container } = await renderWithRouter()

    await submitForm(container)

    expect(wordService.update).toHaveBeenCalledWith(result)
  })

  it('Displays error message failure', async () => {
    wordService.update.mockImplementationOnce(() =>
      Promise.reject(new Error(errorMessage)),
    )
    const { container } = await renderWithRouter()

    await submitForm(container)

    await screen.findByText(errorMessage)
  })

  it('Ignores the update result after unmount', async () => {
    let resolveUpdate: () => void = _.noop
    wordService.update.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveUpdate = resolve
      }),
    )
    const { unmount, container } = await renderWithRouter()
    await submitForm(container)
    unmount()
    await expect(
      (async () => {
        resolveUpdate()
        await Promise.resolve()
      })(),
    ).resolves.toBeUndefined()
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
