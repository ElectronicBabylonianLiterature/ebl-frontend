// @flow
import { Promise } from 'bluebird'
import { factory } from 'factory-girl'
import _ from 'lodash'
import { buildReferenceWithContainerTitle } from 'test-helpers/bibliography-fixtures'
import Reference, { createReference } from './Reference'
import Citation, { CompactCitation, ContainerCitation } from './Citation'
import BibliographyEntry from './BibliographyEntry'

test.each([
  [factory.build('reference'), CompactCitation],
  [buildReferenceWithContainerTitle('PHOTO'), CompactCitation],
  [buildReferenceWithContainerTitle('COPY'), ContainerCitation],
  [buildReferenceWithContainerTitle('EDITION'), ContainerCitation],
  [buildReferenceWithContainerTitle('DISCUSSION'), CompactCitation],
  [
    buildReferenceWithContainerTitle('PHOTO', { id: 'RN2720' }),
    ContainerCitation
  ],
  [
    buildReferenceWithContainerTitle('PHOTO', { id: 'RN2721' }),
    ContainerCitation
  ],
  [
    buildReferenceWithContainerTitle('DISCUSSION', { id: 'RN2720' }),
    ContainerCitation
  ],
  [
    buildReferenceWithContainerTitle('DISCUSSION', { id: 'RN2721' }),
    ContainerCitation
  ]
])('Citation.for %#', async (factoryPromise, ExpectedType) => {
  const reference = await factoryPromise
  expect(Citation.for(reference)).toEqual(new ExpectedType(reference))
})

test('CompactCitation', async () => {
  const reference = await factory.build('reference')
  const citation = new CompactCitation(reference)
  expect(citation.getMarkdown()).toEqual(
    `${reference.author}, ${reference.year}: ${
      reference.pages
    } \\[l. ${reference.linesCited.join(', ')}\\] (${
      reference.typeAbbreviation
    })`
  )
})

test('CompactCitation with empty properties', async () => {
  const reference = await factory.build('reference', {
    pages: '',
    linesCited: []
  })
  const citation = new CompactCitation(reference)
  expect(citation.getMarkdown()).toEqual(
    `${reference.author}, ${reference.year} (${reference.typeAbbreviation})`
  )
})

test('ContainerCitation', async () => {
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
  const citation = new ContainerCitation(reference)
  expect(citation.getMarkdown()).toEqual(
    `*${reference.shortContainerTitle}* ${reference.pages} (${reference.typeAbbreviation})`
  )
})

test('ContainerCitation with collection number', async () => {
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
  const citation = new ContainerCitation(reference)
  expect(citation.getMarkdown()).toEqual(
    `*${reference.shortContainerTitle}* ${collectionNumber}, ${reference.pages} (${reference.typeAbbreviation})`
  )
})

test('ContainerCitation with lines cites and collection number', async () => {
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
  const citation = new ContainerCitation(reference)
  expect(citation.getMarkdown()).toEqual(
    `*${reference.shortContainerTitle}* ${collectionNumber}, ${
      reference.pages
    } \\[l. ${linesCited.join(', ')}\\] (${reference.typeAbbreviation})`
  )
})
