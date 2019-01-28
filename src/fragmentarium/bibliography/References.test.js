import React from 'react'
import { render, waitForElement } from 'react-testing-library'
import { factory } from 'factory-girl'
import _ from 'lodash'
import { Promise } from 'bluebird'

import { changeValueByLabel, clickNth, submitForm } from 'testHelpers'
import References from './References'

const expectedReference = {
  id: 'id',
  type: 'COPY',
  pages: '1-2',
  notes: 'notes',
  linesCited: ['1', '2']
}

let fragment
let element
let fragmentService

beforeEach(() => {
  fragmentService = {
    updateReferences: jest.fn()
  }
})

describe('Edit references', () => {
  beforeEach(() => {
    fragmentService.updateReferences.mockImplementationOnce(() => Promise.resolve())
  })

  test('Add reference', async () => {
    fragment = await factory.build('fragment', { references: [] })
    element = render(<References fragment={fragment} fragmentService={fragmentService} />)

    await clickNth(element, 'Add Reference')
    await inputReference()
    await submitForm(element, 'form')

    expect(fragmentService.updateReferences).toHaveBeenCalledWith(fragment._id, [expectedReference])
  })

  test('Delete reference', async () => {
    fragment = await factory.build('fragment')
    element = render(<References fragment={fragment} fragmentService={fragmentService} />)

    await clickNth(element, 'Delete Reference')
    await submitForm(element, 'form')

    expect(fragmentService.updateReferences).toHaveBeenCalledWith(fragment._id, _.tail(fragment.references))
  })

  test('Edit reference', async () => {
    fragment = await factory.build('fragment')
    element = render(<References fragment={fragment} fragmentService={fragmentService} />)

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
  element = render(<References fragment={fragment} fragmentService={fragmentService} />)
  await inputReference()
  submitForm(element, 'form')
  element.unmount()
  expect(promise.isCancelled()).toBe(true)
})

it('Shows error if updating fails', async () => {
  const errorMessage = 'An error occurred!'
  fragmentService.updateReferences.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)))
  fragment = await factory.build('fragment')
  element = render(<References fragment={fragment} fragmentService={fragmentService} />)

  await inputReference()
  submitForm(element, 'form')

  await waitForElement(() => element.getByText(errorMessage))
})

async function inputReference () {
  await changeValueByLabel(element, 'ID', 'id')
  await changeValueByLabel(element, 'Type', 'COPY')
  await changeValueByLabel(element, 'Pages', '1-2')
  await changeValueByLabel(element, 'Notes', 'notes')
  await changeValueByLabel(element, 'Lines Cited', '1,2')
}
