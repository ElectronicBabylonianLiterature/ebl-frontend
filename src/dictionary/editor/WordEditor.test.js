import React from 'react'
import { matchPath, MemoryRouter } from 'react-router'
import { render, waitForElement } from 'react-testing-library'
import { Promise } from 'bluebird'
import _ from 'lodash'
import { submitForm } from 'testHelpers'
import WordEditor from './WordEditor'
import { factory } from 'factory-girl'

const errorMessage = 'error'
let result
let auth
let wordRepository

beforeEach(async () => {
  result = await factory.build('verb')
  auth = {
    isAllowedTo: jest.fn()
  }
  wordRepository = {
    find: jest.fn(),
    update: jest.fn()
  }
  wordRepository.find.mockReturnValueOnce(Promise.resolve(result))
})

describe('Fecth word', () => {
  it('Queries the word from API', async () => {
    await renderWithRouter()

    expect(wordRepository.find).toBeCalledWith('id')
  })

  it('Displays result on successfull query', async () => {
    const { getByText } = await renderWithRouter()

    expect(getByText(result.lemma.join(' '))).toBeDefined()
  })
})

describe('Update word', () => {
  it('Posts to API on submit', async () => {
    wordRepository.update.mockReturnValueOnce(Promise.resolve())
    const element = await renderWithRouter()

    await submitForm(element, 'form')

    expect(wordRepository.update).toHaveBeenCalledWith(result)
  })

  it('Displays error message failure', async () => {
    wordRepository.update.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)))
    const element = await renderWithRouter()

    await submitForm(element, 'form')

    expect(element.getByText(errorMessage)).toBeDefined()
  })

  it('Cancels promise on unmount', async () => {
    const promise = new Promise(_.noop)
    jest.spyOn(promise, 'cancel')
    wordRepository.update.mockReturnValueOnce(promise)
    const element = await renderWithRouter()
    submitForm(element, 'form')
    element.unmount()
    expect(promise.isCancelled()).toBe(true)
  })
})

describe('User is not allowed to write:words', () => {
  it('The form is disabled', async () => {
    const { container } = await renderWithRouter(false)
    expect(container.querySelector('fieldset').disabled).toBe(true)
  })
})

async function renderWithRouter (isAllowedTo = true) {
  const match = matchPath('/dictionary/id', {
    path: '/dictionary/:id'
  })
  auth.isAllowedTo.mockReturnValueOnce(isAllowedTo)

  const element = render(
    <MemoryRouter>
      <WordEditor match={match} auth={auth} wordRepository={wordRepository} />
    </MemoryRouter>
  )
  await waitForElement(() => element.getByText(result.lemma.join(' ')))
  return element
}
