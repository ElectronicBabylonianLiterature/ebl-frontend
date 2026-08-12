import { ReferenceDto } from 'bibliography/domain/referenceDto'
import {
  FragmentCardSummary,
  FragmentQueryPreviewLine,
  QueryItem,
} from 'query/QueryResult'

export const SUMMARY_LEMMA_ID = 'testWordId'

export const compactPreviewLines: readonly FragmentQueryPreviewLine[] = [
  {
    number: 1,
    prefix: '1.',
    text: 'kur ša',
    tokens: [
      {
        type: 'Word',
        value: 'kur',
        cleanValue: 'kur',
        uniqueLemma: [SUMMARY_LEMMA_ID],
      },
      {
        type: 'Word',
        value: 'ša',
        cleanValue: 'ša',
        uniqueLemma: [],
      },
    ],
  },
  {
    number: 2,
    prefix: '2.',
    text: 'ana bīti',
    tokens: [
      {
        type: 'Word',
        value: 'ana',
        cleanValue: 'ana',
        uniqueLemma: [],
      },
      {
        type: 'Word',
        value: 'bīti',
        cleanValue: 'bīti',
        uniqueLemma: [],
      },
    ],
  },
]

export const compactMatchingLinePreview = {
  lines: compactPreviewLines,
}

export function cardSummaryLines(
  queryItem: QueryItem,
): readonly FragmentQueryPreviewLine[] {
  if (queryItem.cardSummary?.type !== 'FragmentCardSummary') {
    throw new Error(
      `Expected a FragmentCardSummary for ${queryItem.museumNumber}.`,
    )
  }
  return queryItem.cardSummary.matchingLinePreview
}

export function createFragmentCardSummary(
  lines: readonly FragmentQueryPreviewLine[] = compactPreviewLines,
): FragmentCardSummary {
  return {
    type: 'FragmentCardSummary',
    matchingLinePreview: lines,
  }
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
