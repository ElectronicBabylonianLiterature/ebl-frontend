import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  buildReferenceWithManyAuthors,
  buildReferenceWithContainerTitle,
  referenceFactory,
} from 'test-support/bibliography-fixtures'

import createReference from 'bibliography/application/createReference'
import {
  borgerDocument,
  productionSummaryReferences,
  seriesDocument,
} from 'test-support/fragment-query-summary'
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

test('shows an honest non-interactive fallback without citation metadata', () => {
  const reference = createReference(
    productionSummaryReferences[0],
  ).withIdentity('RN52', true)
  render(<CompactCitation references={[reference]} />)
  const fallback = screen.getByText(/RN52/)

  expect(fallback).toHaveTextContent('RN52: 12-13 [l. 1.] [Summary note] (D)')
  expect(fallback).toHaveClass('reference-summary-fallback')
  expect(
    screen.queryByText(/RN52/, { selector: '.reference-popover__citation' }),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
})

test('renders an empty compact reference as an honest unknown fallback', () => {
  const reference = createReference({
    id: '',
    type: 'COPY',
    pages: '',
    notes: '',
    linesCited: [],
  }).withIdentity('', true)

  render(<CompactCitation references={[reference]} />)

  expect(screen.getByText('Unknown reference')).toBeVisible()
  expect(screen.getByText('(C)')).toBeVisible()
  expect(screen.queryByText(/Unknown reference:/)).not.toBeInTheDocument()
})

test('renders all available details for grouped compact references', () => {
  const references = productionSummaryReferences.map((reference) =>
    createReference(reference).withIdentity(reference.id, true),
  )

  render(<CompactCitation references={references} />)

  expect(screen.getByText(/RN52/)).toHaveTextContent(
    'RN52: 12-13 [l. 1.] [Summary note]; 27 (D)',
  )
})

test('retains rich citation behavior when a compact reference has metadata', () => {
  const reference = createReference({
    id: 'ROOT-1',
    type: 'EDITION',
    pages: '8',
    notes: '',
    linesCited: [],
    document: {
      id: 'DOC-1',
      title: 'Edition title',
      author: [{ family: 'Editor' }],
      issued: { 'date-parts': [[2020]] },
    },
  })

  render(<CompactCitation references={[reference]} />)

  expect(screen.getByText(/Editor, 2020/)).toHaveClass(
    'reference-popover__interactive',
  )
  expect(
    screen.queryByText(/ROOT-1/, { selector: '.reference-summary-fallback' }),
  ).not.toBeInTheDocument()
})

test('renders no citation when no references are supplied', () => {
  const { container } = render(<CompactCitation references={[]} />)
  expect(container).toBeEmptyDOMElement()
})

test('renders a summary-joined reference exactly like a full one', () => {
  const referenceDto = {
    ...productionSummaryReferences[0],
    document: borgerDocument,
  }
  const summaryRendering = render(
    <CompactCitation references={[createReference(referenceDto)]} />,
  ).container.innerHTML
  const fullRendering = render(
    <CompactCitation
      references={[createReference({ ...referenceDto, id: 'RN52' })]}
    />,
  ).container.innerHTML

  expect(summaryRendering).toEqual(fullRendering)
  expect(summaryRendering).toContain('reference-popover__citation')
})

test('renders a series citation for a joined container document', () => {
  const reference = createReference({
    ...productionSummaryReferences[1],
    type: 'COPY',
    document: seriesDocument,
  })

  const { container } = render(<CompactCitation references={[reference]} />)

  expect(container).toHaveTextContent('CT 51, 27 (C)')
})

test('keeps the master citation path for a reference that never had a document', () => {
  const reference = createReference({
    id: 'RN99',
    type: 'DISCUSSION',
    pages: '5',
    notes: '',
    linesCited: [],
  })

  const { container } = render(<CompactCitation references={[reference]} />)

  expect(container).toHaveTextContent(': 5 (D)')
  expect(screen.queryByText(/RN99/)).not.toBeInTheDocument()
})
