import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  buildReferenceWithManyAuthors,
  buildReferenceWithContainerTitle,
  referenceFactory,
} from 'test-support/bibliography-fixtures'

import CompactCitation from './CompactCitation'

test('Shows compact citation', () => {
  const reference = referenceFactory.build()
  const { container } = render(<CompactCitation references={[reference]} />)
  expect(container).toHaveTextContent(
    `${reference.authors.join(' & ')}, ${reference.year}: ${
      reference.pages
    } [l. ${reference.linesCited.join(', ')}] (${reference.typeAbbreviation})`,
  )
})

test('Shows compact citation with et al.', () => {
  const reference = buildReferenceWithManyAuthors()
  const { container } = render(<CompactCitation references={[reference]} />)
  expect(container).toHaveTextContent(
    `${reference.primaryAuthor} et al., ${reference.year}: ${
      reference.pages
    } [l. ${reference.linesCited.join(', ')}] (${reference.typeAbbreviation})`,
  )
})

test('Shows compact citation with container title', () => {
  const reference = buildReferenceWithContainerTitle('COPY').setLinesCited([])
  const { container } = render(<CompactCitation references={[reference]} />)
  expect(container).toHaveTextContent(
    `${reference.shortContainerTitle}, ${reference.pages} (${reference.typeAbbreviation})`,
  )
})

test('Shows compact citation with container title and collection number', () => {
  const collectionNumber = '76'
  const reference = buildReferenceWithContainerTitle('COPY', {
    'collection-number': collectionNumber,
  }).setLinesCited([])
  const { container } = render(<CompactCitation references={[reference]} />)
  expect(container).toHaveTextContent(
    `${reference.shortContainerTitle} ${collectionNumber}, ${reference.pages} (${reference.typeAbbreviation})`,
  )
})

test('Shows compact citation with container title, lines cites and collection number', () => {
  const collectionNumber = '76'
  const linesCited = ['2.', '4.']
  const reference = buildReferenceWithContainerTitle('COPY', {
    'collection-number': collectionNumber,
  }).setLinesCited(linesCited)
  const { container } = render(<CompactCitation references={[reference]} />)
  expect(container).toHaveTextContent(
    `${reference.shortContainerTitle} ${collectionNumber}, ${
      reference.pages
    } [l. ${linesCited.join(', ')}] (${reference.typeAbbreviation})`,
  )
})

test('Shows grouped references', () => {
  const reference1 = referenceFactory.build({
    pages: '10',
    linesCited: ['1'],
  })
  const reference2 = referenceFactory.build({
    ...reference1,
    pages: '12',
    linesCited: ['2'],
  })
  const groupedReferences = [reference1, reference2]

  render(<CompactCitation references={groupedReferences} />)

  expect(
    screen.getByText(new RegExp(`${reference1.primaryAuthor}`)),
  ).toBeInTheDocument()

  expect(screen.getByText('10 [l. 1]')).toBeInTheDocument()
  expect(screen.getByText('12 [l. 2]')).toBeInTheDocument()
  expect(
    screen.getByText(`(${reference1.typeAbbreviation})`),
  ).toBeInTheDocument()
})
