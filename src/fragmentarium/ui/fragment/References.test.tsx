import React from 'react'
import { render, screen } from '@testing-library/react'
import { Promise } from 'bluebird'
import _ from 'lodash'

import { changeValueByLabel, clickNth, submitForm } from 'test-support/utils'
import References from './References'
import Reference from 'bibliography/domain/Reference'
import {
  buildBorger1957,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

const defaultReference = new Reference()

let container: HTMLElement
let expectedReference: Reference
let references: Reference[]
let searchEntry: BibliographyEntry
let searchBibliography
let updateReferences

beforeEach(async () => {
  searchEntry = buildBorger1957()
  expectedReference = new Reference(
    'COPY',
    '1-2',
    'notes',
    ['1', '2'],
    searchEntry,
  )
  searchBibliography = (): Promise<BibliographyEntry[]> =>
    Promise.resolve([searchEntry])
  updateReferences = jest.fn()
})

describe('Edit references', () => {
  test('Add reference', async () => {
    references = referenceFactory.buildList(2)
    await renderReferencesAndWait()
    clickNth(screen, 'Add Reference')
    await submitForm(container)

    expect(updateReferences).toHaveBeenCalledWith([
      ...references,
      defaultReference,
    ])
  })

  test('Delete reference', async () => {
    references = referenceFactory.buildList(2)
    await renderReferencesAndWait()
    clickNth(screen, 'Delete Reference')
    await submitForm(container)

    expect(updateReferences).toHaveBeenCalledWith(_.tail(references))
  })

  test('Edit reference', async () => {
    references = referenceFactory.buildList(2)
    await renderReferencesAndWait()
    await inputReference()
    await submitForm(container)

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
  await submitForm(container)

  expect(updateReferences).toHaveBeenCalledWith([defaultReference])
})

function renderReferences(): void {
  container = render(
    <References
      references={references}
      searchBibliography={searchBibliography}
      updateReferences={updateReferences}
    />,
  ).container
}

async function renderReferencesAndWait(): Promise<void> {
  renderReferences()
  await screen.findAllByText('Document')
}

async function inputReference(): Promise<void> {
  changeValueByLabel(screen, /ReferenceForm-Document-.*/, 'Borger')
  await screen.findByText(/Borger 1957/)
  clickNth(screen, /Borger 1957/, 0)
  changeValueByLabel(screen, 'Type', 'COPY')
  changeValueByLabel(screen, 'Pages', '1-2')
  changeValueByLabel(screen, 'Notes', 'notes')
  changeValueByLabel(screen, 'Lines Cited', '1,2')
}
