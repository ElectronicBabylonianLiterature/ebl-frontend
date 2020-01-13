import React from 'react'
import { render } from '@testing-library/react'
import { factory } from 'factory-girl'
import {
  buildReferenceWithManyAuthors,
  buildReferenceWithContainerTitle
} from 'test-helpers/bibliography-fixtures'

import CompactCitation from './CompactCitation'

test('Shows compact citation', async () => {
  const reference = await factory.build('reference')
  const { container } = render(<CompactCitation reference={reference} />)
  expect(container).toHaveTextContent(
    `${reference.authors.join(' & ')}, ${reference.year}: ${
      reference.pages
    } [l. ${reference.linesCited.join(', ')}] (${reference.typeAbbreviation})`
  )
})

test('Shows compact citation with et al.', async () => {
  const reference = await buildReferenceWithManyAuthors()
  const { container } = render(<CompactCitation reference={reference} />)
  expect(container).toHaveTextContent(
    `${reference.primaryAuthor} et al., ${reference.year}: ${
      reference.pages
    } [l. ${reference.linesCited.join(', ')}] (${reference.typeAbbreviation})`
  )
})

test('Shows compact citation with container title', async () => {
  const reference = (
    await buildReferenceWithContainerTitle('COPY')
  ).setLinesCited([])
  const { container } = render(<CompactCitation reference={reference} />)
  expect(container).toHaveTextContent(
    `${reference.shortContainerTitle} ${reference.pages} (${reference.typeAbbreviation})`
  )
})

test('Shows compact citation with container title and collection number', async () => {
  const collectionNumber = '76'
  const reference = (
    await buildReferenceWithContainerTitle('COPY', {
      'collection-number': collectionNumber
    })
  ).setLinesCited([])
  const { container } = render(<CompactCitation reference={reference} />)
  expect(container).toHaveTextContent(
    `${reference.shortContainerTitle} ${collectionNumber}, ${reference.pages} (${reference.typeAbbreviation})`
  )
})

test('Shows compact citation with container title, lines cites and collection number', async () => {
  const collectionNumber = '76'
  const linesCited = ['2.', '4.']
  const reference = (
    await buildReferenceWithContainerTitle('COPY', {
      'collection-number': collectionNumber
    })
  ).setLinesCited(linesCited)
  const { container } = render(<CompactCitation reference={reference} />)
  expect(container).toHaveTextContent(
    `${reference.shortContainerTitle} ${collectionNumber}, ${
      reference.pages
    } [l. ${linesCited.join(', ')}] (${reference.typeAbbreviation})`
  )
})
