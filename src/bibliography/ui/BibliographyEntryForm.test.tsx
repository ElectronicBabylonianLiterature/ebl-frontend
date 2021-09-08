import React from 'react'
import { render, screen } from '@testing-library/react'
import _ from 'lodash'

import { changeValueByLabel, clickNth } from 'test-support/utils'
import BibliographyEntryForm from './BibliographyEntryForm'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

let json: string
let entry: BibliographyEntry
let onSubmit: () => void

beforeEach(() => {
  entry = bibliographyEntryFactory.build()
  json = JSON.stringify(entry.toCslData(), null, 2)
  onSubmit = jest.fn()
})

test(`Changing document calls onChange with updated value.`, async () => {
  render(<BibliographyEntryForm onSubmit={onSubmit} />)
  changeValueByLabel(screen, 'Data', json)
  await screen.findByText(new RegExp(_.escapeRegExp(`(${entry.year})`)))
  clickNth(screen, 'Save', 0)

  expect(onSubmit).toHaveBeenCalledWith(entry)
})

test(`Shows value as CSL-JSON.`, async () => {
  render(<BibliographyEntryForm value={entry} onSubmit={onSubmit} />)
  await screen.findByDisplayValue(
    new RegExp(_.escapeRegExp(json).replace(/\s+/g, '\\s*'))
  )
})
