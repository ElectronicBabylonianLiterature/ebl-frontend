import React from 'react'
import { render, wait, waitForElement } from 'react-testing-library'
import _ from 'lodash'

import { changeValueByLabel, clickNth } from 'testHelpers'
import BibliographyEntry from './BibliographyEntry'
import BibliographyEntryForm from './BibliographyEntryForm'

const cslJson = {
  'id': 'Miccadei2002Synergistic',
  'title': 'The Synergistic Activity of Thyroid Transcription Factor 1 and Pax 8 Relies on the Promoter/Enhancer Interplay',
  'type': 'article-journal',
  'DOI': '10.1210/MEND.16.4.0808',
  'issued': {
    'date-parts': [
      [
        2002
      ]
    ]
  },
  'year-suffix': 'Synergistic',
  'volume': '16',
  'page': '837-846',
  'issue': '4',
  'citation-label': 'Miccadei2002Synergistic',
  'container-title': 'Molecular Endocrinology',
  'author': [
    {
      'given': 'Stefania',
      'family': 'Miccadei'
    },
    {
      'given': 'Rossana',
      'family': 'De Leo'
    },
    {
      'given': 'Enrico',
      'family': 'Zammarchi'
    },
    {
      'given': 'Pier Giorgio',
      'family': 'Natali'
    },
    {
      'given': 'Donato',
      'family': 'Civitareale'
    }
  ]
}
const json = JSON.stringify(cslJson, null, 2)
const entry = new BibliographyEntry(cslJson)
let element
let onSubmit

beforeEach(async () => {
  onSubmit = jest.fn()
})

test(`Changing document calls onChange with updated value.`, async () => {
  element = render(<BibliographyEntryForm onSubmit={onSubmit} />)
  changeValueByLabel(element, 'Data', json)
  await waitForElement(() => element.getByText(/Miccadei, S\., De Leo, R\., Zammarchi, E\., Natali, P\. G\., & Civitareale, D\. \(2002\)/))
  clickNth(element, 'Save', 0)
  await wait()

  expect(onSubmit).toHaveBeenCalledWith(entry)
})

test(`Shows value as CSL-JSON.`, async () => {
  element = render(<BibliographyEntryForm value={entry} onSubmit={onSubmit} />)
  await waitForElement(() => element.getByDisplayValue(new RegExp(_.escapeRegExp(json).replace(/\s+/g, '\\s*'))))
})
