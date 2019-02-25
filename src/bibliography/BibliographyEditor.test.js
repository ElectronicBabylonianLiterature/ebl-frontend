import React from 'react'
import { matchPath, MemoryRouter } from 'react-router'
import { render, waitForElement } from 'react-testing-library'
import { Promise } from 'bluebird'
import _ from 'lodash'
import { factory } from 'factory-girl'
import SessionContext from 'auth/SessionContext'
import { submitForm } from 'testHelpers'
import BibliographyEditor from './BibliographyEditor'
import { template } from 'bibliography/bibliographyEntry'

const errorMessage = 'error'
const createWaitFor = /family name/
const resultId = 'RN1000'
let result
let bibliographyService
let session

beforeEach(async () => {
  result = await factory.build('bibliographyEntry', { id: resultId })
  session = {
    isAllowedToReadBibliography: _.stubTrue(),
    isAllowedToWriteBibliography: jest.fn()
  }
  bibliographyService = {
    find: jest.fn(),
    update: jest.fn(),
    create: jest.fn()
  }
})

describe('Editing', () => {
  beforeEach(() => {
    bibliographyService.find.mockReturnValueOnce(Promise.resolve(result))
  })

  test('Queries the entry from API', async () => {
    await renderWithRouter(true, false, resultId)

    expect(bibliographyService.find).toBeCalledWith('id')
  })

  test('Displays result on successfull query', async () => {
    const { container } = await renderWithRouter(true, false, resultId)

    expect(container).toHaveTextContent(JSON.stringify(result.toJson(), null, 1).replace(/\s+/g, ' '))
  })

  test('Posts on submit', async () => {
    bibliographyService.update.mockReturnValueOnce(Promise.resolve())
    const element = await renderWithRouter(true, false, resultId)

    await submitForm(element, 'form')

    expect(bibliographyService.update).toHaveBeenCalledWith(result)
  })

  commonTests(false, resultId)
})

describe('Creating', () => {
  test('Displays template', async () => {
    const { container } = await renderWithRouter(true, true, createWaitFor)

    expect(container).toHaveTextContent(JSON.stringify(template.toJson(), null, 1).replace(/\s+/g, ' '))
  })

  test('Puts on submit', async () => {
    bibliographyService.create.mockReturnValueOnce(Promise.resolve())
    const element = await renderWithRouter(true, true, createWaitFor)

    await submitForm(element, 'form')

    expect(bibliographyService.create).toHaveBeenCalledWith(template)
  })

  commonTests(true, createWaitFor)
})

function commonTests (create, waitFor) {
  test('Displays error message failed submit', async () => {
    bibliographyService.update.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)))
    bibliographyService.create.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)))
    const element = await renderWithRouter(true, create, waitFor)

    await submitForm(element, 'form')

    await waitForElement(() => element.getByText(errorMessage))
  })

  test('Cancels promise on unmount', async () => {
    const promise = new Promise(_.noop)
    jest.spyOn(promise, 'cancel')
    bibliographyService.update.mockReturnValueOnce(promise)
    bibliographyService.create.mockReturnValueOnce(promise)
    const element = await renderWithRouter(true, create, waitFor)
    submitForm(element, 'form')
    element.unmount()
    expect(promise.isCancelled()).toBe(true)
  })

  test('Saving is disabled when not allowed to write:bibliography', async () => {
    const { getByText } = await renderWithRouter(false, create, waitFor)
    expect(getByText('Save').disabled).toBe(true)
  })
}

async function renderWithRouter (isAllowedTo = true, create = false, waitFor) {
  const match = create
    ? matchPath('/bibliography', {
      path: '/bibliography'
    })
    : matchPath('/bibliography/id', {
      path: '/bibliography/:id'
    })
  session.isAllowedToWriteBibliography.mockReturnValue(isAllowedTo)

  const element = render(
    <MemoryRouter>
      <SessionContext.Provider value={session}>
        <BibliographyEditor match={match} bibliographyService={bibliographyService} create={create} />
      </SessionContext.Provider>
    </MemoryRouter>
  )
  await waitForElement(() => element.getByText(waitFor))
  return element
}
