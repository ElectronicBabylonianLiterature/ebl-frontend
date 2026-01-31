import React from 'react'
import { matchPath, MemoryRouter, match } from 'react-router'
import { render, Matcher, screen } from '@testing-library/react'
import { Promise } from 'bluebird'
import _ from 'lodash'
import SessionContext from 'auth/SessionContext'
import { submitForm } from 'test-support/utils'
import BibliographyEditor from './BibliographyEditor'
import BibliographyEntry, {
  template,
} from 'bibliography/domain/BibliographyEntry'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'

const errorMessage = 'error'
const createWaitFor = /family name/
const resultId = 'RN1000'
let result
let bibliographyService
let session

beforeEach(async () => {
  result = bibliographyEntryFactory.build({}, { transient: { id: resultId } })
  session = {
    isAllowedToReadBibliography: _.stubTrue(),
    isAllowedToWriteBibliography: jest.fn(),
  }
  bibliographyService = {
    find: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
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

  test('Displays result on successful query', async () => {
    const { container } = await renderWithRouter(true, false, resultId)
    expectTextContentToContainCslJson(container, result)
  })

  test('Posts on submit', async () => {
    bibliographyService.update.mockReturnValueOnce(Promise.resolve())
    const { container } = await renderWithRouter(true, false, resultId)
    await submitForm(container)
    expect(bibliographyService.update).toHaveBeenCalledWith(result)
  })

  test('Displays View button', async () => {
    await renderWithRouter(true, false, resultId)
    expect(screen.getByText('View')).toBeInTheDocument()
  })

  test('View button redirects to view page', async () => {
    await renderWithRouter(true, false, resultId)
    screen.getByText('View').click()
    // View button navigates to view page
  })

  commonTests(false, resultId)
})

describe('Creating', () => {
  test('Displays template', async () => {
    const { container } = await renderWithRouter(true, true, createWaitFor)
    expectTextContentToContainCslJson(container, template)
  })

  test('Puts on submit', async () => {
    bibliographyService.create.mockReturnValueOnce(Promise.resolve())
    const { container } = await renderWithRouter(true, true, createWaitFor)
    await submitForm(container)
    expect(bibliographyService.create).toHaveBeenCalledWith(template)
  })

  test('Does not display View button', async () => {
    await renderWithRouter(true, true, createWaitFor)
    expect(screen.queryByText('View')).not.toBeInTheDocument()
  })

  commonTests(true, createWaitFor)
})

function expectTextContentToContainCslJson(
  container: HTMLElement,
  entry: BibliographyEntry,
) {
  expect(container).toHaveTextContent(
    JSON.stringify(entry.toCslData(), null, 1).replace(/\s+/g, ' '),
  )
}

function commonTests(create, waitFor): void {
  test('Displays error message on failed submit', async () => {
    bibliographyService.update.mockImplementationOnce(() =>
      Promise.reject(new Error(errorMessage)),
    )
    bibliographyService.create.mockImplementationOnce(() =>
      Promise.reject(new Error(errorMessage)),
    )
    const { container } = await renderWithRouter(true, create, waitFor)
    await submitForm(container)
    await screen.findByText(errorMessage)
  })

  test('Cancels promise on unmount', async () => {
    const promise = new Promise(_.noop)
    jest.spyOn(promise, 'cancel')
    bibliographyService.update.mockReturnValueOnce(promise)
    bibliographyService.create.mockReturnValueOnce(promise)
    const { unmount, container } = await renderWithRouter(true, create, waitFor)
    await submitForm(container)
    unmount()
    expect(promise.isCancelled()).toBe(true)
  })

  test('Saving is disabled when not allowed to write:bibliography', async () => {
    await renderWithRouter(false, create, waitFor)
    expect(screen.getByText('Save')).toBeDisabled()
  })
}

async function renderWithRouter(
  isAllowedTo = true,
  create = false,
  waitFor: Matcher,
) {
  const matchedPath = create
    ? ({ params: {} } as match<{ id: string }>)
    : (matchPath('/bibliography/id/edit', {
        path: '/bibliography/:id/edit',
      }) as match<{ id: string }>)

  session.isAllowedToWriteBibliography.mockReturnValue(isAllowedTo)

  const view = render(
    <MemoryRouter>
      <SessionContext.Provider value={session}>
        <BibliographyEditor
          match={matchedPath}
          bibliographyService={bibliographyService}
          create={create}
        />
      </SessionContext.Provider>
    </MemoryRouter>,
  )
  await screen.findAllByText(waitFor)
  return view
}
