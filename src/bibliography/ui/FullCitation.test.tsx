import React from 'react'
import { render } from '@testing-library/react'

import FullCitation from './FullCitation'
import {
  bibliographyEntryFactory,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Reference from 'bibliography/domain/Reference'

let entry: BibliographyEntry
let reference: Reference
let container: HTMLElement

describe('With link', () => {
  beforeEach(() => {
    entry = bibliographyEntryFactory.build()
    reference = referenceFactory.build({ document: entry })
    container = render(<FullCitation reference={reference} />).container
  })

  commomTests()

  test('A', async () => {
    expect(container.querySelector('a')).toHaveAttribute('href', entry.link)
  })
})

describe('Without link', () => {
  beforeEach(() => {
    entry = bibliographyEntryFactory.build({}, { transient: { URL: null } })
    reference = referenceFactory.build({ document: entry })
    container = render(<FullCitation reference={reference} />).container
  })

  commomTests()

  test('No A', () => {
    expect(container.querySelector('a')).toBeNull()
  })
})

function commomTests() {
  test('Formatted citation', () => {
    expect(container).toHaveTextContent(entry.title)
  })

  test('Notes', () => {
    expect(container).toHaveTextContent(reference.notes)
  })
}
