import React from 'react'
import { render, screen } from '@testing-library/react'
import _ from 'lodash'

import FullCitation from './FullCitation'
import {
  bibliographyEntryFactory,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import Reference from 'bibliography/domain/Reference'

let entry: BibliographyEntry
let reference: Reference

describe('With link', () => {
  beforeEach(() => {
    entry = bibliographyEntryFactory.build()
    reference = referenceFactory.build({ document: entry })
    render(<FullCitation reference={reference} />)
  })

  commomTests()

  test('A', async () => {
    expect(screen.getByRole('link')).toHaveAttribute('href', entry.link)
  })
})

describe('Without link', () => {
  beforeEach(() => {
    entry = bibliographyEntryFactory.build({}, { transient: { URL: null } })
    reference = referenceFactory.build({ document: entry })
    render(<FullCitation reference={reference} />)
  })

  commomTests()

  test('No A', () => {
    expect(screen.queryByRole('a')).not.toBeInTheDocument()
  })
})

function commomTests() {
  test('Formatted citation', () => {
    expect(
      screen.getByText(RegExp(_.escapeRegExp(entry.title)))
    ).toBeInTheDocument()
  })

  test('Notes', () => {
    expect(screen.getByText(`[${reference.notes}]`)).toBeInTheDocument()
  })
}
