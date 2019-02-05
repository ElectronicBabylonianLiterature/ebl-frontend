import React from 'react'
import { render, waitForElement } from 'react-testing-library'
import { factory } from 'factory-girl'
import _ from 'lodash'
import { Promise } from 'bluebird'

import { changeValueByLabel, clickNth, submitForm } from 'testHelpers'
import References from './References'

const defaultReference = {
  id: '',
  type: 'DISCUSSION',
  pages: '',
  notes: '',
  linesCited: [],
  document: null
}

let expectedReference
let references
let element
let fragmentService
let searchEntry
let updateReferences

beforeEach(async () => {
  searchEntry = await factory.build('bibliographyEntry', {
    author: [{ family: 'Borger' }],
    issued: { 'date-parts': [[1957]] }
  })
  expectedReference = {
    id: searchEntry.id,
    type: 'COPY',
    pages: '1-2',
    notes: 'notes',
    linesCited: ['1', '2'],
    document: searchEntry
  }
  fragmentService = {
    searchBibliography: () => Promise.resolve([searchEntry])
  }
  updateReferences = jest.fn()
})

describe('Edit references', () => {
  beforeEach(async () => {
    references = await factory.buildMany('hydratedReference', 2)
    await renderReferencesAndWait()
  })

  test('Add reference', async () => {
    await clickNth(element, 'Add Reference')
    await submitForm(element, 'form')

    expect(updateReferences).toHaveBeenCalledWith([
      ...references,
      defaultReference
    ])
  })

  test('Delete reference', async () => {
    await clickNth(element, 'Delete Reference')
    await submitForm(element, 'form')

    expect(updateReferences).toHaveBeenCalledWith(_.tail(references))
  })

  test('Edit reference', async () => {
    await inputReference()
    await submitForm(element, 'form')

    expect(updateReferences).toHaveBeenCalledWith([
      expectedReference,
      ..._.tail(references)
    ])
  })
})

it('Creates a default reference if none present', async () => {
  updateReferences.mockImplementationOnce(() => Promise.resolve())
  references = []
  await renderReferencesAndWait()
  await submitForm(element, 'form')

  expect(updateReferences).toHaveBeenCalledWith([
    defaultReference
  ])
})

function renderReferences () {
  element = render(<References
    references={references}
    fragmentService={fragmentService}
    updateReferences={updateReferences} />)
}

async function renderReferencesAndWait () {
  renderReferences()
  await waitForElement(() => element.getByText('References'))
}

async function inputReference () {
  changeValueByLabel(element, 'Document', 'Borger')
  await waitForElement(() => element.getByText(/Borger 1957/))
  clickNth(element, /Borger 1957/, 0)
  changeValueByLabel(element, 'Type', 'COPY')
  changeValueByLabel(element, 'Pages', '1-2')
  changeValueByLabel(element, 'Notes', 'notes')
  changeValueByLabel(element, 'Lines Cited', '1,2')
}
