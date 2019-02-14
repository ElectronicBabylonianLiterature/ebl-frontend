import React from 'react'
import { matchPath, MemoryRouter } from 'react-router'
import { render, waitForElement } from 'react-testing-library'
import { Promise } from 'bluebird'
import _ from 'lodash'
import { factory } from 'factory-girl'
import SessionContext from 'auth/SessionContext'
import { submitForm } from 'testHelpers'
import BibliographyEditor from './BibliographyEditor'

const errorMessage = 'error'
let result
let bibliographyRepository
let session

beforeEach(async () => {
  result = await factory.build('bibliographyEntry')
  session = {
    isAllowedToReadBibliography: _.stubTrue(),
    isAllowedToWriteBibliography: jest.fn()
  }
  bibliographyRepository = {
    find: jest.fn(),
    update: jest.fn()
  }
  bibliographyRepository.find.mockReturnValueOnce(Promise.resolve(result))
})

describe('Fecth entry', () => {
  it('Queries the entry from API', async () => {
    await renderWithRouter()

    expect(bibliographyRepository.find).toBeCalledWith('id')
  })

  it('Displays result on successfull query', async () => {
    const { container } = await renderWithRouter()

    expect(container).toHaveTextContent(result.toBibtex().replace(/\s+/g, ' '))
  })
})

describe('Update entry', () => {
  it('Posts to API on submit', async () => {
    bibliographyRepository.update.mockReturnValueOnce(Promise.resolve())
    const element = await renderWithRouter()

    await submitForm(element, 'form')

    expect(bibliographyRepository.update).toHaveBeenCalledWith(result)
  })

  it('Displays error message failure', async () => {
    bibliographyRepository.update.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)))
    const element = await renderWithRouter()

    await submitForm(element, 'form')

    await waitForElement(() => element.getByText(errorMessage))
  })

  it('Cancels promise on unmount', async () => {
    const promise = new Promise(_.noop)
    jest.spyOn(promise, 'cancel')
    bibliographyRepository.update.mockReturnValueOnce(promise)
    const element = await renderWithRouter()
    submitForm(element, 'form')
    element.unmount()
    expect(promise.isCancelled()).toBe(true)
  })
})

describe('User is not allowed to write:bibliography', () => {
  it('Saving is disabled', async () => {
    const { getByText } = await renderWithRouter(false)
    expect(getByText('Save').disabled).toBe(true)
  })
})

async function renderWithRouter (isAllowedTo = true) {
  const match = matchPath('/bibliography/id', {
    path: '/bibliography/:id'
  })
  session.isAllowedToWriteBibliography.mockReturnValueOnce(isAllowedTo)

  const element = render(
    <MemoryRouter>
      <SessionContext.Provider value={session}>
        <BibliographyEditor match={match} bibliographyRepository={bibliographyRepository} />
      </SessionContext.Provider>
    </MemoryRouter>
  )
  await waitForElement(() => element.getByText(result.id))
  return element
}
