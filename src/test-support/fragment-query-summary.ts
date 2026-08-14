import { ReferenceDto } from 'bibliography/domain/referenceDto'
import { CslData } from 'bibliography/domain/BibliographyEntry'
import { FragmentCardSummary } from 'query/QueryResult'
import { BibliographyDocumentsDto } from 'fragmentarium/infrastructure/fragmentQueryMapping'
import { summaryPreviewLines } from 'test-support/fragment-query-preview'

export { SUMMARY_LEMMA_ID } from 'test-support/fragment-query-preview'

export const compactMatchingLinePreview = {
  lines: summaryPreviewLines,
}

export function createFragmentCardSummary(): FragmentCardSummary {
  return { type: 'FragmentCardSummary' }
}

export const productionSummaryReferences: readonly ReferenceDto[] = [
  {
    id: 'RN52',
    type: 'DISCUSSION',
    pages: '12-13',
    notes: 'Summary note',
    linesCited: ['1.'],
  },
  {
    id: 'RN54',
    type: 'DISCUSSION',
    pages: '27',
    notes: '',
    linesCited: [],
  },
]

export const borgerDocument: CslData = {
  id: 'RN52',
  type: 'book',
  title: 'Handbuch der Keilschriftliteratur',
  author: [{ family: 'Borger', given: 'Rykle' }],
  issued: { 'date-parts': [[1957]] },
  URL: 'https://example.com/borger',
}

export const seriesDocument: CslData = {
  id: 'RN54',
  type: 'book',
  title: 'Cuneiform Texts',
  'container-title-short': 'CT',
  'collection-number': '51',
  author: [{ family: 'Lambert', given: 'Wilfred' }],
  issued: { 'date-parts': [[1974]] },
  DOI: '10.1000/ct51',
}

export const summaryBibliographyDocuments: BibliographyDocumentsDto = {
  RN52: borgerDocument,
  RN54: seriesDocument,
}
