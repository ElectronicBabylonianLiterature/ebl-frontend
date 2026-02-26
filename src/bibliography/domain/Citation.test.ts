import {
  buildReferenceWithContainerTitle,
  buildReferenceWithManyAuthors,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import Citation, { CompactCitation, ContainerCitation } from './Citation'

test.each([
  [referenceFactory.build(), CompactCitation],
  [buildReferenceWithContainerTitle('PHOTO'), CompactCitation],
  [buildReferenceWithContainerTitle('COPY'), ContainerCitation],
  [buildReferenceWithContainerTitle('EDITION'), ContainerCitation],
  [buildReferenceWithContainerTitle('DISCUSSION'), CompactCitation],
  [
    buildReferenceWithContainerTitle('PHOTO', { id: 'RN2720' }),
    ContainerCitation,
  ],
  [
    buildReferenceWithContainerTitle('PHOTO', { id: 'RN2721' }),
    ContainerCitation,
  ],
  [
    buildReferenceWithContainerTitle('DISCUSSION', { id: 'RN2720' }),
    ContainerCitation,
  ],
  [
    buildReferenceWithContainerTitle('DISCUSSION', { id: 'RN2721' }),
    ContainerCitation,
  ],
])('Citation.for %#', async (reference, ExpectedType) => {
  expect(Citation.for(reference)).toEqual(new ExpectedType(reference))
})

test('CompactCitation', () => {
  const reference = referenceFactory.build()
  const citation = new CompactCitation(reference)
  expect(citation.getMarkdown()).toEqual(
    `${reference.authors.join(' & ')}, ${reference.year}: ${
      reference.pages
    } \\[l. ${reference.linesCited.join(', ')}\\]`,
  )
})

test('CompactCitation with empty properties', () => {
  const reference = referenceFactory.build({
    pages: '',
    linesCited: [],
  })
  const citation = new CompactCitation(reference)
  expect(citation.getMarkdown()).toEqual(
    `${reference.authors.join(' & ')}, ${reference.year}`,
  )
})

test('CompactCitation with more than 3 authors', () => {
  const reference = buildReferenceWithManyAuthors()
  const citation = new CompactCitation(reference)
  expect(citation.getMarkdown()).toEqual(
    `${reference.primaryAuthor} *et al.*, ${reference.year}: ${
      reference.pages
    } \\[l. ${reference.linesCited.join(', ')}\\]`,
  )
})

test('ContainerCitation', () => {
  const reference = buildReferenceWithContainerTitle('COPY').setLinesCited([])
  const citation = new ContainerCitation(reference)
  expect(citation.getMarkdown()).toEqual(
    `*${reference.shortContainerTitle}*, ${reference.pages}`,
  )
})

test('ContainerCitation with collection number', () => {
  const collectionNumber = '76'
  const reference = buildReferenceWithContainerTitle('COPY', {
    'collection-number': collectionNumber,
  }).setLinesCited([])
  const citation = new ContainerCitation(reference)
  expect(citation.getMarkdown()).toEqual(
    `*${reference.shortContainerTitle}* ${collectionNumber}, ${reference.pages}`,
  )
})

test('ContainerCitation with lines cites and collection number', async () => {
  const collectionNumber = '76'
  const linesCited = ['2.', '4.']
  const reference = (
    await buildReferenceWithContainerTitle('COPY', {
      'collection-number': collectionNumber,
    })
  ).setLinesCited(linesCited)
  const citation = new ContainerCitation(reference)
  expect(citation.getMarkdown()).toEqual(
    `*${reference.shortContainerTitle}* ${collectionNumber}, ${
      reference.pages
    } \\[l. ${linesCited.join(', ')}\\]`,
  )
})
