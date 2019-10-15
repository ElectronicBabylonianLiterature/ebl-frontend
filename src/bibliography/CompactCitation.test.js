import React from 'react'
import { render } from '@testing-library/react'
import { factory } from 'factory-girl'

import CompactCitation from './CompactCitation'

test('Shows compact citation', async () => {
  const reference = await factory.build('reference')
  const { container } = render(<CompactCitation reference={reference} />)
  expect(container).toHaveTextContent(reference.compactCitation)
})

test('Shows compact citation with container title', async () => {
  const reference = await factory
    .build('cslDataWithContainerTitleShort')
    .then(cslData => factory.build('bibliographyEntry', cslData))
    .then(entry =>
      factory.build('reference', { type: 'COPY', document: entry })
    )
  const { container } = render(<CompactCitation reference={reference} />)
  expect(container).toHaveTextContent(
    `${reference.shortContainerTitle} ${reference.pages}`
  )
})

test('Shows compact citation with container title', async () => {
  const reference = await factory
    .build('cslDataWithContainerTitleShort')
    .then(cslData => factory.build('bibliographyEntry', cslData))
    .then(entry =>
      factory.build('reference', {
        type: 'COPY',
        document: entry,
        linesCited: []
      })
    )
  const { container } = render(<CompactCitation reference={reference} />)
  expect(container).toHaveTextContent(
    `${reference.shortContainerTitle} ${reference.pages} (${reference.typeAbbreviation})`
  )
})

test('Shows compact citation with container title and collection number', async () => {
  const collectionNumber = '76'
  const reference = await factory
    .build('cslDataWithContainerTitleShort', {
      'collection-number': collectionNumber
    })
    .then(cslData => factory.build('bibliographyEntry', cslData))
    .then(entry =>
      factory.build('reference', {
        type: 'COPY',
        document: entry,
        linesCited: []
      })
    )
  const { container } = render(<CompactCitation reference={reference} />)
  expect(container).toHaveTextContent(
    `${reference.shortContainerTitle} ${collectionNumber}, ${reference.pages} (${reference.typeAbbreviation})`
  )
})

test('Shows compact citation with container title, lines cites and collection number', async () => {
  const collectionNumber = '76'
  const linesCited = ['2.', '4.']
  const reference = await factory
    .build('cslDataWithContainerTitleShort', {
      'collection-number': collectionNumber
    })
    .then(cslData => factory.build('bibliographyEntry', cslData))
    .then(entry =>
      factory.build('reference', {
        type: 'COPY',
        document: entry,
        linesCited: linesCited
      })
    )
  const { container } = render(<CompactCitation reference={reference} />)
  expect(container).toHaveTextContent(
    `${reference.shortContainerTitle} ${collectionNumber}, ${
      reference.pages
    } [l. ${linesCited.join(', ')}] (${reference.typeAbbreviation})`
  )
})
