import { createQueryResult } from 'fragmentarium/infrastructure/fragmentQueryMapping'
import { fragmentDto } from 'test-support/test-fragment'
import {
  borgerDocument,
  productionSummaryReferences,
  seriesDocument,
  summaryBibliographyDocuments,
} from 'test-support/fragment-query-summary'
import { summaryPreviewLines } from 'test-support/fragment-query-preview'
import Reference from 'bibliography/domain/Reference'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import serializeReference from 'bibliography/application/serializeReference'
import { BibliographyDocumentsDto } from 'fragmentarium/infrastructure/fragmentQueryMapping'

function summaryReferences(
  bibliographyDocuments: BibliographyDocumentsDto,
): readonly Reference[] {
  const result = createQueryResult({
    matchCountTotal: 1,
    bibliographyDocuments,
    items: [
      {
        museumNumber: fragmentDto.museumNumber,
        accession: null,
        description: 'summary',
        script: { ...fragmentDto.script, period: 'LB' },
        references: productionSummaryReferences,
        matchingLines: [1],
        matchingLinePreview: { lines: summaryPreviewLines },
        matchCount: 1,
        hasPhoto: false,
      },
    ],
  })
  return result.items[0].fragment?.references ?? []
}

describe('summary bibliography join', () => {
  it('joins documents by reference id and keeps citation metadata', () => {
    const [first, second] = summaryReferences(summaryBibliographyDocuments)

    expect(first.primaryAuthor).toEqual('Borger')
    expect(first.year).toEqual('1957')
    expect(first.link).toEqual('https://example.com/borger')
    expect(second.shortContainerTitle).toEqual('CT')
    expect(second.collectionNumber).toEqual('51')
    expect(second.link).toEqual('https://doi.org/10.1000/ct51')
  })

  it('keeps the occurrence reference id when the document was redirected', () => {
    const [first] = summaryReferences({
      RN52: { ...borgerDocument, id: 'CANONICAL-1' },
      RN54: seriesDocument,
    })

    expect(first.id).toEqual('RN52')
    expect(first.document.id).toEqual('CANONICAL-1')
    expect(first.primaryAuthor).toEqual('Borger')
  })

  it('serializes the replacement document id after an explicit edit', () => {
    const [first] = summaryReferences({
      RN52: { ...borgerDocument, id: 'CANONICAL-1' },
      RN54: seriesDocument,
    })
    const replacement = new BibliographyEntry({
      ...seriesDocument,
      id: 'RN99',
    })

    expect(serializeReference(first.setDocument(replacement)).id).toEqual(
      'RN99',
    )
  })

  it('keeps distinct grouping keys for same-type references', () => {
    const references = summaryReferences(summaryBibliographyDocuments)

    expect(
      references.map((reference) => `${reference.id}-${reference.type}`),
    ).toEqual(['RN52-DISCUSSION', 'RN54-DISCUSSION'])
  })

  it('degrades safely when a document is missing from the map', () => {
    const [first, second] = summaryReferences({ RN54: seriesDocument })

    expect(first.document.label.trim()).toEqual('')
    expect(first.hasUnresolvedDocument).toBe(true)
    expect(first.id).toEqual('RN52')
    expect(first.pages).toEqual('12-13')
    expect(second.document.label.trim()).not.toEqual('')
    expect(second.hasUnresolvedDocument).toBe(false)
  })

  it('never marks a resolved document as unresolved', () => {
    const references = summaryReferences(summaryBibliographyDocuments)

    expect(
      references.map((reference) => reference.hasUnresolvedDocument),
    ).toEqual([false, false])
  })

  it('degrades safely when the response omits the document map entirely', () => {
    const [first] = summaryReferences({})

    expect(first.document.label.trim()).toEqual('')
    expect(first.id).toEqual('RN52')
  })
})
