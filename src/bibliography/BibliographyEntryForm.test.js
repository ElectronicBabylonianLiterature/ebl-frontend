import React from 'react'
import { render, wait, waitForElement } from 'react-testing-library'
import _ from 'lodash'
import { factory } from 'factory-girl'

import { changeValueByLabel, clickNth } from 'test-helpers/utils'
import BibliographyEntryForm from './BibliographyEntryForm'

let json
let entry
let element
let onSubmit

beforeEach(async () => {
  entry = await factory.build('bibliographyEntry')
  json = JSON.stringify(entry.toJson(), null, 2)
  onSubmit = jest.fn()
})

test(`Changing document calls onChange with updated value.`, async () => {
  element = render(<BibliographyEntryForm onSubmit={onSubmit} />)
  changeValueByLabel(element, 'Data', json)
  await waitForElement(() => element.getByText(new RegExp(_.escapeRegExp(`(${entry.year})`))))
  clickNth(element, 'Save', 0)
  await wait()

  expect(onSubmit).toHaveBeenCalledWith(entry)
})

test(`Shows value as CSL-JSON.`, async () => {
  element = render(<BibliographyEntryForm value={entry} onSubmit={onSubmit} />)
  await waitForElement(() => element.getByDisplayValue(new RegExp(_.escapeRegExp(json).replace(/\s+/g, '\\s*'))))
})
