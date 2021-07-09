import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import _ from 'lodash'

import { changeValueByLabel, clickNth } from 'test-support/utils'
import BibliographyEntryForm from './BibliographyEntryForm'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

let json: string
let entry: BibliographyEntry
let element: RenderResult
let onSubmit: () => void

beforeEach(() => {
  entry = bibliographyEntryFactory.build()
  json = JSON.stringify(entry.toCslData(), null, 2)
  onSubmit = jest.fn()
})

test(`Changing document calls onChange with updated value.`, async () => {
  element = render(<BibliographyEntryForm onSubmit={onSubmit} />)
  changeValueByLabel(element, 'Data', json)
  await element.findByText(new RegExp(_.escapeRegExp(`(${entry.year})`)))
  clickNth(element, 'Save', 0)

  expect(onSubmit).toHaveBeenCalledWith(entry)
})

test(`Shows value as CSL-JSON.`, async () => {
  element = render(<BibliographyEntryForm value={entry} onSubmit={onSubmit} />)
  await element.findByDisplayValue(
    new RegExp(_.escapeRegExp(json).replace(/\s+/g, '\\s*'))
  )
})
