import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentDto from 'fragmentarium/domain/FragmentDtos'
import { QueryItem, QueryResult } from 'query/QueryResult'
import { toMuseumNumberString } from 'fragmentarium/domain/MuseumNumber'
import { createFragment } from 'fragmentarium/infrastructure/FragmentRepository'
import {
  BibliographyDocumentsDto,
  createQuerySummaryFragment,
  isQuerySummaryItemDto,
  isSummaryLineIndexes,
  isSummaryMatchCount,
  QueryMuseumNumberDto,
  QuerySummaryItemDto,
} from 'fragmentarium/infrastructure/querySummaryFragment'

export type {
  BibliographyDocumentsDto,
  FragmentQueryPreviewDto,
  FragmentQueryPreviewLineDto,
  QueryMuseumNumberDto,
  QuerySummaryArchaeologyDto,
  QuerySummaryItemDto,
} from 'fragmentarium/infrastructure/querySummaryFragment'

export type QueryItemDto = {
  museumNumber: QueryMuseumNumberDto
  matchingLines: readonly number[]
  matchCount: number
  fragment?: FragmentDto
}

export type QueryResultItemDto = QueryItemDto | QuerySummaryItemDto

export type LatestQueryItemDto = QueryResultItemDto

export type LatestQueryResultDto = {
  items: readonly LatestQueryItemDto[]
  matchCountTotal: number | null
  isMatchCountTotalExact?: boolean
  hasNextPage?: boolean | null
  bibliographyDocuments?: BibliographyDocumentsDto
  fragments?: readonly FragmentDto[]
}

export type QueryResultDto = {
  items: readonly QueryResultItemDto[]
  matchCountTotal: number | null
  isMatchCountTotalExact?: boolean
  hasNextPage?: boolean | null
  bibliographyDocuments?: BibliographyDocumentsDto
}

const SUMMARY_MARKER_FIELDS = [
  'description',
  'script',
  'hasPhoto',
  'matchingLinePreview',
  'thumbnailPath',
] as const

function isSummaryShapedDto(dto: QueryResultItemDto): boolean {
  return SUMMARY_MARKER_FIELDS.some((field) => field in dto)
}

function createQueryItemIdentity(dto: QueryResultItemDto): QueryItem {
  return {
    museumNumber: toMuseumNumberString(dto.museumNumber),
    matchingLines: isSummaryLineIndexes(dto.matchingLines)
      ? dto.matchingLines
      : [],
    matchCount: isSummaryMatchCount(dto.matchCount) ? dto.matchCount : 0,
  }
}

function createQueryItem(
  dto: QueryResultItemDto,
  bibliographyDocuments: BibliographyDocumentsDto,
): QueryItem {
  const queryItem = createQueryItemIdentity(dto)

  if (isQuerySummaryItemDto(dto)) {
    return {
      ...queryItem,
      fragment: createQuerySummaryFragment(dto, bibliographyDocuments),
      cardSummary: { type: 'FragmentCardSummary' },
      thumbnailPath: dto.thumbnailPath ?? null,
    }
  }

  if (isSummaryShapedDto(dto) || !queryItem.museumNumber) {
    return {
      ...queryItem,
      cardSummary: { type: 'UnsupportedFragmentCardSummary' },
    }
  }

  const prefetchedFragment = dto.fragment && createFragment(dto.fragment)
  return prefetchedFragment
    ? { ...queryItem, fragment: prefetchedFragment }
    : queryItem
}

export function createQueryResult(dto: QueryResultDto): QueryResult {
  return {
    matchCountTotal: dto.matchCountTotal,
    isMatchCountTotalExact: dto.isMatchCountTotalExact,
    hasNextPage: dto.hasNextPage,
    items: dto.items.map((itemDto) =>
      createQueryItem(itemDto, dto.bibliographyDocuments ?? {}),
    ),
  }
}

export function createLatestQueryResult(
  dto: LatestQueryResultDto,
): QueryResult {
  const fragmentsByMuseumNumber = new Map<string, Fragment>(
    (dto.fragments ?? []).map((fragmentDto) => {
      const fragment = createFragment(fragmentDto)
      return [fragment.number, fragment]
    }),
  )

  return {
    matchCountTotal: dto.matchCountTotal,
    isMatchCountTotalExact: dto.isMatchCountTotalExact,
    hasNextPage: dto.hasNextPage,
    items: dto.items.map((itemDto) => {
      const queryItem = createQueryItem(
        itemDto,
        dto.bibliographyDocuments ?? {},
      )
      const prefetchedFragment =
        queryItem.fragment ??
        fragmentsByMuseumNumber.get(queryItem.museumNumber)

      return prefetchedFragment
        ? { ...queryItem, fragment: prefetchedFragment }
        : queryItem
    }),
  }
}
