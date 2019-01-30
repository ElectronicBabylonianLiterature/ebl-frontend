import React from 'react'
import { render, waitForElement } from 'react-testing-library'
import { factory } from 'factory-girl'
import _ from 'lodash'
import { Promise } from 'bluebird'

import { changeValueByLabel, clickNth, submitForm } from 'testHelpers'
import References from './References'

let expectedReference
let fragment
let element
let fragmentService
let entry
let searchEntry

beforeEach(async () => {
  entry = await factory.build('bibliographyEntry')
  searchEntry = await factory.build('bibliographyEntry', { author: [{ family: 'Borger' }], issued: { 'date-parts': [[1957]] } })
  expectedReference = {
    id: searchEntry.id,
    type: 'COPY',
    pages: '1-2',
    notes: 'notes',
    linesCited: ['1', '2']
  }
  fragmentService = {
    updateReferences: jest.fn(),
    findBibliography: () => Promise.resolve(entry),
    searchBibliography: () => Promise.resolve([searchEntry])
  }
})

describe('Edit references', () => {
  beforeEach(async () => {
    fragmentService.updateReferences.mockImplementationOnce(() => Promise.resolve())
  })

  test('Add reference', async () => {
    fragment = await factory.build('fragment', { references: [] })
    await renderReferences()

    await clickNth(element, 'Add Reference')
    await inputReference()
    await submitForm(element, 'form')

    expect(fragmentService.updateReferences).toHaveBeenCalledWith(fragment._id, [expectedReference])
  })

  test('Delete reference', async () => {
    fragment = await factory.build('fragment')
    await renderReferences()

    await clickNth(element, 'Delete Reference')
    await submitForm(element, 'form')

    expect(fragmentService.updateReferences).toHaveBeenCalledWith(fragment._id, _.tail(fragment.references))
  })

  test('Edit reference', async () => {
    fragment = await factory.build('fragment')
    await renderReferences()

    await inputReference()
    await submitForm(element, 'form')

    expect(fragmentService.updateReferences).toHaveBeenCalledWith(fragment._id, [
      expectedReference,
      ..._.tail(fragment.references)
    ])
  })
})

it('Cancels submit on unmount', async () => {
  const promise = new Promise(_.noop)
  jest.spyOn(promise, 'cancel')
  fragmentService.updateReferences.mockReturnValueOnce(promise)
  fragment = await factory.build('fragment')
  await renderReferences()

  await inputReference()
  submitForm(element, 'form')
  element.unmount()
  expect(promise.isCancelled()).toBe(true)
})

it('Shows error if updating fails', async () => {
  const errorMessage = 'An error occurred!'
  fragmentService.updateReferences.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)))
  fragment = await factory.build('fragment')
  await renderReferences()

  await inputReference()
  submitForm(element, 'form')

  await waitForElement(() => element.getByText(errorMessage))
})

async function renderReferences () {
  element = render(<References fragment={fragment} fragmentService={fragmentService} />)
  await waitForElement(() => element.getByText('References'))
}

async function inputReference () {
  changeValueByLabel(element, 'Document', 'Borger')
  await waitForElement(() => element.getByText(/Borger 1957/))
  clickNth(element, /Borger 1957/, 0)
  await changeValueByLabel(element, 'Type', 'COPY')
  await changeValueByLabel(element, 'Pages', '1-2')
  await changeValueByLabel(element, 'Notes', 'notes')
  await changeValueByLabel(element, 'Lines Cited', '1,2')
}
