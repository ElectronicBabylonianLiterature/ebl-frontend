import React from 'react'
import { render, wait, waitForElement } from 'react-testing-library'

import { changeValueByLabel, clickNth } from 'testHelpers'
import BibliographyEntry from './bibliographyEntry'
import BibliographyEntryForm from './BibliographyEntryForm'

const bibtex = `@article{Miccadei2002Synergistic,
author={Miccadei, Stefania and De Leo, Rossana and Zammarchi, Enrico and Natali, Pier Giorgio and Civitareale, Donato},
doi={10.1210/MEND.16.4.0808},
journal={Molecular Endocrinology},
issue=4,
pages={837--846},
title={{The Synergistic Activity of Thyroid Transcription Factor 1 and Pax 8 Relies on the Promoter/Enhancer Interplay}},
volume=16,
year=2002,
}`

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
const entry = new BibliographyEntry(cslJson)
let element
let onSubmit

beforeEach(async () => {
  onSubmit = jest.fn()
})

test(`Changing document calls onChange with updated value.`, async () => {
  element = render(<BibliographyEntryForm onSubmit={onSubmit} />)
  changeValueByLabel(element, 'Data', bibtex)
  await waitForElement(() => element.getByText(/Miccadei, S\., De Leo, R\., Zammarchi, E\., Natali, P\. G\., & Civitareale, D\. \(2002\)/))
  clickNth(element, 'Save', 0)
  await wait()

  expect(onSubmit).toHaveBeenCalledWith(entry)
})

test(`Shows value in BibTeX.`, async () => {
  element = render(<BibliographyEntryForm value={entry} onSubmit={onSubmit} />)
  await waitForElement(() => element.getByDisplayValue(/@article\{Miccadei2002Synergistic,\s*journal=\{Molecular Endocrinology\},\s*doi=\{10\.1210\/MEND\.16\.4\.0808\},\s*number=4,\s*title=\{The Synergistic Activity of Thyroid Transcription Factor 1 and Pax 8 Relies on the Promoter\/Enhancer Interplay\},\s*volume=16,\s*author=\{Miccadei, Stefania and De Leo, Rossana and Zammarchi, Enrico and Natali, Pier Giorgio and Civitareale, Donato\},\s*pages=\{837--846\},\s*date=2002,\s*year=2002,\s*\}/))
})
