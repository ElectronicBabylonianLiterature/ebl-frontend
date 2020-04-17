import React from 'react'
import { render } from '@testing-library/react'
import { factory } from 'factory-girl'
import { Promise } from 'bluebird'
import _ from 'lodash'

import { changeValueByLabel, clickNth, submitForm } from 'test-helpers/utils'
import References from './References'
import Reference from 'bibliography/domain/Reference'

const defaultReference = new Reference()

let expectedReference
let references
let element
let searchEntry
let searchBibliography
let updateReferences

beforeEach(async () => {
  searchEntry = await factory.build('bibliographyEntry', {
    author: [{ family: 'Borger' }],
    issued: { 'date-parts': [[1957]] },
  })
  expectedReference = new Reference(
    'COPY',
    '1-2',
    'notes',
    ['1', '2'],
    searchEntry
  )
  searchBibliography = () => Promise.resolve([searchEntry])
  updateReferences = jest.fn()
})

describe('Edit references', () => {
  beforeEach(async () => {
    references = await factory.buildMany('reference', 2)
    await renderReferencesAndWait()
  })

  test('Add reference', async () => {
    clickNth(element, 'Add Reference')
    await submitForm(element)

    expect(updateReferences).toHaveBeenCalledWith([
      ...references,
      defaultReference,
    ])
  })

  test('Delete reference', async () => {
    clickNth(element, 'Delete Reference')
    await submitForm(element)

    expect(updateReferences).toHaveBeenCalledWith(_.tail(references))
  })

  test('Edit reference', async () => {
    await inputReference()
    await submitForm(element)

    expect(updateReferences).toHaveBeenCalledWith([
      expectedReference,
      ..._.tail(references),
    ])
  })
})

it('Creates a default reference if none present', async () => {
  updateReferences.mockImplementationOnce(() => Promise.resolve())
  references = []
  await renderReferencesAndWait()
  await submitForm(element)

  expect(updateReferences).toHaveBeenCalledWith([defaultReference])
})

function renderReferences() {
  element = render(
    <References
      references={references}
      searchBibliography={searchBibliography}
      updateReferences={updateReferences}
    />
  )
}

async function renderReferencesAndWait() {
  renderReferences()
  await element.findAllByText('Document')
}

async function inputReference() {
  changeValueByLabel(element, 'Document', 'Borger')
  await element.findByText(/Borger 1957/)
  clickNth(element, /Borger 1957/, 0)
  changeValueByLabel(element, 'Type', 'COPY')
  changeValueByLabel(element, 'Pages', '1-2')
  changeValueByLabel(element, 'Notes', 'notes')
  changeValueByLabel(element, 'Lines Cited', '1,2')
}
