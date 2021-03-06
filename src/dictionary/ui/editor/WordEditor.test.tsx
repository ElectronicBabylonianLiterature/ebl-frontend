import React, { ReactNode } from 'react'
import { render, RenderResult } from '@testing-library/react'
import Bluebird from 'bluebird'
import _ from 'lodash'
import { factory } from 'factory-girl'
import SessionContext from 'auth/SessionContext'
import { submitForm } from 'test-support/utils'
import WordEditor from './WordEditor'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'

const errorMessage = 'error'
let result
let wordService
let session

beforeEach(async () => {
  result = await factory.build('verb')
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
    const { getByText } = await renderWithRouter()

    expect(getByText(result.lemma.join(' '))).toBeInTheDocument()
  })
})

describe('Update word', () => {
  it('Posts to API on submit', async () => {
    wordService.update.mockReturnValueOnce(Bluebird.resolve())
    const element = await renderWithRouter()

    await submitForm(element)

    expect(wordService.update).toHaveBeenCalledWith(result)
  })

  it('Displays error message failure', async () => {
    wordService.update.mockImplementationOnce(() =>
      Bluebird.reject(new Error(errorMessage))
    )
    const element = await renderWithRouter()

    await submitForm(element)

    await element.findByText(errorMessage)
  })

  it('Cancels promise on unmount', async () => {
    const promise = new Bluebird(_.noop)
    jest.spyOn(promise, 'cancel')
    wordService.update.mockReturnValueOnce(promise)
    const element = await renderWithRouter()
    await submitForm(element)
    element.unmount()
    expect(promise.isCancelled()).toBe(true)
  })
})

describe('User is not allowed to write:words', () => {
  it('The form is disabled', async () => {
    const { getByRole } = await renderWithRouter(false)
    expect(getByRole('group')).toBeDisabled()
  })
})

async function renderWithRouter(isAllowedTo = true): Promise<RenderResult> {
  session.isAllowedToWriteWords.mockReturnValueOnce(isAllowedTo)

  const element = render(
    <MemoryRouter initialEntries={['/dictionary/id']}>
      <SessionContext.Provider value={session}>
        <Route
          path="/dictionary/:id"
          render={(props: RouteComponentProps<{ id: string }>): ReactNode => (
            <WordEditor wordService={wordService} {...props} />
          )}
        />
      </SessionContext.Provider>
    </MemoryRouter>
  )
  await element.findByText(result.lemma.join(' '))
  return element
}
