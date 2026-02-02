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
  function setup(): void {
    entry = bibliographyEntryFactory.build()
    reference = referenceFactory.build({ document: entry })
    render(<FullCitation reference={reference} />)
  }

  commomTests(setup)

  test('A', async () => {
    setup()
    expect(screen.getByRole('link')).toHaveAttribute('href', entry.link)
  })
})

describe('Without link', () => {
  function setup(): void {
    entry = bibliographyEntryFactory.build({}, { transient: { URL: null } })
    reference = referenceFactory.build({ document: entry })
    render(<FullCitation reference={reference} />)
  }

  commomTests(setup)

  test('No A', () => {
    setup()
    expect(screen.queryByRole('a')).not.toBeInTheDocument()
  })
})

function commomTests(setup: () => void) {
  test('Formatted citation', () => {
    setup()
    expect(
      screen.getByText(RegExp(_.escapeRegExp(entry.title))),
    ).toBeInTheDocument()
  })

  test('Notes', () => {
    setup()
    expect(screen.getByText(`[${reference.notes}]`)).toBeInTheDocument()
  })
}
