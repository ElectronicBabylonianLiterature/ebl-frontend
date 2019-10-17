// @flow
import { Promise } from 'bluebird'
import { factory } from 'factory-girl'
import _ from 'lodash'
import {
  buildReferenceWithContainerTitle,
  buildReferenceWithManyAuthors
} from 'test-helpers/bibliography-fixtures'
import Reference from './Reference'
import createReference from 'bibliography/application/createReference'
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
    `${reference.authors.join(' & ')}, ${reference.year}: ${
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
    `${reference.authors.join(' & ')}, ${reference.year} (${
      reference.typeAbbreviation
    })`
  )
})

test('CompactCitation with more than 3 authors', async () => {
  const authors = await factory.buildMany('author', 4)
  const reference = await buildReferenceWithManyAuthors()
  const citation = new CompactCitation(reference)
  expect(citation.getMarkdown()).toEqual(
    `${reference.primaryAuthor} *et al.*, ${reference.year}: ${
      reference.pages
    } \\[l. ${reference.linesCited.join(', ')}\\] (${
      reference.typeAbbreviation
    })`
  )
})

test('ContainerCitation', async () => {
  const reference = (await buildReferenceWithContainerTitle(
    'COPY'
  )).setLinesCited([])
  const citation = new ContainerCitation(reference)
  expect(citation.getMarkdown()).toEqual(
    `*${reference.shortContainerTitle}* ${reference.pages} (${reference.typeAbbreviation})`
  )
})

test('ContainerCitation with collection number', async () => {
  const collectionNumber = '76'
  const reference = (await buildReferenceWithContainerTitle('COPY', {
    'collection-number': collectionNumber
  })).setLinesCited([])
  const citation = new ContainerCitation(reference)
  expect(citation.getMarkdown()).toEqual(
    `*${reference.shortContainerTitle}* ${collectionNumber}, ${reference.pages} (${reference.typeAbbreviation})`
  )
})

test('ContainerCitation with lines cites and collection number', async () => {
  const collectionNumber = '76'
  const linesCited = ['2.', '4.']
  const reference = (await buildReferenceWithContainerTitle('COPY', {
    'collection-number': collectionNumber
  })).setLinesCited(linesCited)
  const citation = new ContainerCitation(reference)
  expect(citation.getMarkdown()).toEqual(
    `*${reference.shortContainerTitle}* ${collectionNumber}, ${
      reference.pages
    } \\[l. ${linesCited.join(', ')}\\] (${reference.typeAbbreviation})`
  )
})
