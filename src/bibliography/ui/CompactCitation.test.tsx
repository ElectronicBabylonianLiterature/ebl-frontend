import React from 'react'
import { render } from '@testing-library/react'
import {
  buildReferenceWithManyAuthors,
  buildReferenceWithContainerTitle,
  referenceFactory,
} from 'test-support/bibliography-fixtures'

import CompactCitation from './CompactCitation'

test('Shows compact citation', () => {
  const reference = referenceFactory.build()
  const { container } = render(<CompactCitation reference={reference} />)
  expect(container).toHaveTextContent(
    `${reference.authors.join(' & ')}, ${reference.year}: ${
      reference.pages
    } [l. ${reference.linesCited.join(', ')}] (${reference.typeAbbreviation})`
  )
})

test('Shows compact citation with et al.', () => {
  const reference = buildReferenceWithManyAuthors()
  const { container } = render(<CompactCitation reference={reference} />)
  expect(container).toHaveTextContent(
    `${reference.primaryAuthor} et al., ${reference.year}: ${
      reference.pages
    } [l. ${reference.linesCited.join(', ')}] (${reference.typeAbbreviation})`
  )
})

test('Shows compact citation with container title', () => {
  const reference = buildReferenceWithContainerTitle('COPY').setLinesCited([])
  const { container } = render(<CompactCitation reference={reference} />)
  expect(container).toHaveTextContent(
    `${reference.shortContainerTitle}, ${reference.pages} (${reference.typeAbbreviation})`
  )
})

test('Shows compact citation with container title and collection number', () => {
  const collectionNumber = '76'
  const reference = buildReferenceWithContainerTitle('COPY', {
    'collection-number': collectionNumber,
  }).setLinesCited([])
  const { container } = render(<CompactCitation reference={reference} />)
  expect(container).toHaveTextContent(
    `${reference.shortContainerTitle} ${collectionNumber}, ${reference.pages} (${reference.typeAbbreviation})`
  )
})

test('Shows compact citation with container title, lines cites and collection number', () => {
  const collectionNumber = '76'
  const linesCited = ['2.', '4.']
  const reference = buildReferenceWithContainerTitle('COPY', {
    'collection-number': collectionNumber,
  }).setLinesCited(linesCited)
  const { container } = render(<CompactCitation reference={reference} />)
  expect(container).toHaveTextContent(
    `${reference.shortContainerTitle} ${collectionNumber}, ${
      reference.pages
    } [l. ${linesCited.join(', ')}] (${reference.typeAbbreviation})`
  )
})
