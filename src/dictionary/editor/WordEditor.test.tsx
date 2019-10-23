import React from 'react'
import { matchPath, MemoryRouter } from 'react-router'
import { render, waitForElement } from '@testing-library/react'
import { Promise } from 'bluebird'
import _ from 'lodash'
import { factory } from 'factory-girl'
import SessionContext from 'auth/SessionContext'
import { submitForm } from 'test-helpers/utils'
import WordEditor from './WordEditor'

const errorMessage = 'error'
let result
let wordService
let session

beforeEach(async () => {
  result = await factory.build('verb')
  session = {
    isAllowedToReadWords: _.stubTrue(),
    isAllowedToWriteWords: jest.fn()
  }
  wordService = {
    find: jest.fn(),
    update: jest.fn()
  }
  wordService.find.mockReturnValueOnce(Promise.resolve(result))
})

describe('Fecth word', () => {
  it('Queries the word from API', async () => {
    await renderWithRouter()

    expect(wordService.find).toBeCalledWith('id')
  })

  it('Displays result on successfull query', async () => {
    const { getByText } = await renderWithRouter()

    expect(getByText(result.lemma.join(' '))).toBeDefined()
  })
})

describe('Update word', () => {
  it('Posts to API on submit', async () => {
    wordService.update.mockReturnValueOnce(Promise.resolve())
    const element = await renderWithRouter()

    submitForm(element, 'form')

    expect(wordService.update).toHaveBeenCalledWith(result)
  })

  it('Displays error message failure', async () => {
    wordService.update.mockImplementationOnce(() =>
      Promise.reject(new Error(errorMessage))
    )
    const element = await renderWithRouter()

    submitForm(element, 'form')

    await waitForElement(() => element.getByText(errorMessage))
  })

  it('Cancels promise on unmount', async () => {
    const promise = new Promise(_.noop)
    jest.spyOn(promise, 'cancel')
    wordService.update.mockReturnValueOnce(promise)
    const element = await renderWithRouter()
    submitForm(element, 'form')
    element.unmount()
    expect(promise.isCancelled()).toBe(true)
  })
})

describe('User is not allowed to write:words', () => {
  it('The form is disabled', async () => {
    const { container } = await renderWithRouter(false)
    expect((container.querySelector('fieldset') as HTMLFieldSetElement).disabled).toBe(true)
  })
})

async function renderWithRouter(isAllowedTo = true) {
  const match = matchPath('/dictionary/id', {
    path: '/dictionary/:id'
  })
  session.isAllowedToWriteWords.mockReturnValueOnce(isAllowedTo)

  const element = render(
    <MemoryRouter>
      <SessionContext.Provider value={session}>
        <WordEditor match={match} wordService={wordService} />
      </SessionContext.Provider>
    </MemoryRouter>
  )
  await waitForElement(() => element.getByText(result.lemma.join(' ')))
  return element
}
