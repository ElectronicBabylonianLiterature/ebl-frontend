import React from 'react'
import { render } from '@testing-library/react'
import { factory } from 'factory-girl'

import FullCitation from './FullCitation'

let entry
let reference
let container

describe('With link', () => {
  beforeEach(async () => {
    entry = await factory.build('bibliographyEntry')
    reference = await factory.build('reference', { document: entry })
    container = render(<FullCitation reference={reference} />).container
  })

  commomTests()

  test('A', async () => {
    expect(container.querySelector('a')).toHaveAttribute('href', entry.link)
  })
})

describe('Without link', () => {
  beforeEach(async () => {
    entry = await factory.build('bibliographyEntry', { URL: '' })
    reference = await factory.build('reference', { document: entry })
    container = render(<FullCitation reference={reference} />).container
  })

  commomTests()

  test('No A', async () => {
    expect(container.querySelector('a')).toBeNull()
  })
})

function commomTests () {
  test('Formatted citation', async () => {
    expect(container).toHaveTextContent(entry.title)
  })

  test('Notes', async () => {
    expect(container).toHaveTextContent(reference.notes)
  })
}
