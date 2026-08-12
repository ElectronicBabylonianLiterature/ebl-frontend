import { Fragment } from 'fragmentarium/domain/fragment'
import { Genres } from 'fragmentarium/domain/Genres'
import { MesopotamianDate } from 'chronology/domain/Date'
import FragmentDto, {
  MesopotamianDateDto,
} from 'fragmentarium/domain/FragmentDtos'
import { ScriptDto } from 'fragmentarium/domain/fragment'
import {
  FragmentQueryPreviewLine,
  FragmentQueryPreviewToken,
  QueryItem,
  QueryResult,
} from 'query/QueryResult'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import { Museums } from 'fragmentarium/domain/museum'
import { createCompactReference } from 'bibliography/application/createReference'
import { createResearchProject } from 'research-projects/researchProject'
import {
  createFragment,
  createScript,
} from 'fragmentarium/infrastructure/FragmentRepository'
import { Text } from 'transliteration/domain/text'

export type QueryMuseumNumberDto = {
  prefix: string
  number: string
  suffix: string
}

export type QueryItemDto = {
  museumNumber: QueryMuseumNumberDto
  matchingLines: readonly number[]
  matchCount: number
  fragment?: FragmentDto
}

export type FragmentQueryPreviewTokenDto = FragmentQueryPreviewToken
export type FragmentQueryPreviewLineDto = FragmentQueryPreviewLine

export type FragmentQueryPreviewDto = {
  lines: readonly FragmentQueryPreviewLineDto[]
}

export type QuerySummaryArchaeologyDto = {
  excavationNumber: QueryMuseumNumberDto | null
  site: { name: string } | null
} | null

export type QuerySummaryItemDto = {
  museumNumber: QueryMuseumNumberDto
  accession?: QueryMuseumNumberDto | null
  description: string
  script: ScriptDto
  date?: MesopotamianDateDto | null
  genres?: FragmentDto['genres']
  archaeology?: QuerySummaryArchaeologyDto
  references?: FragmentDto['references']
  projects?: FragmentDto['projects']
  dossiers?: FragmentDto['dossiers']
  matchingLines: readonly number[]
  matchingLinePreview?: FragmentQueryPreviewDto | null
  matchCount: number
  hasPhoto: boolean
  thumbnailPath?: string | null
}

export type QueryResultItemDto = QueryItemDto | QuerySummaryItemDto

export type LatestQueryItemDto = QueryResultItemDto

export type LatestQueryResultDto = {
  items: readonly LatestQueryItemDto[]
  matchCountTotal: number | null
  isMatchCountTotalExact?: boolean
  hasNextPage?: boolean | null
  fragments?: readonly FragmentDto[]
}

export type QueryResultDto = {
  items: readonly QueryResultItemDto[]
  matchCountTotal: number | null
  isMatchCountTotalExact?: boolean
  hasNextPage?: boolean | null
}

const SUMMARY_MARKER_FIELDS = [
  'description',
  'script',
  'hasPhoto',
  'matchingLinePreview',
  'thumbnailPath',
] as const

function isQuerySummaryItemDto(
  dto: QueryResultItemDto,
): dto is QuerySummaryItemDto {
  const candidate = dto as Partial<QuerySummaryItemDto>
  return (
    typeof candidate.description === 'string' &&
    typeof candidate.hasPhoto === 'boolean' &&
    typeof candidate.script === 'object' &&
    candidate.script !== null
  )
}

function isSummaryShapedDto(dto: QueryResultItemDto): boolean {
  return SUMMARY_MARKER_FIELDS.some((field) => field in dto)
}

function createQuerySummaryFragment(dto: QuerySummaryItemDto): Fragment {
  return Fragment.create({
    number: museumNumberToString(dto.museumNumber),
    accession: dto.accession ? museumNumberToString(dto.accession) : '',
    publication: '',
    acquisition: null,
    description: dto.description,
    joins: [],
    measures: {
      length: null,
      width: null,
      thickness: null,
      lengthNote: null,
      widthNote: null,
      thicknessNote: null,
    },
    collection: '',
    legacyScript: '',
    cdliImages: [],
    folios: [],
    record: [],
    text: new Text({ lines: [] }),
    notes: { text: '', parts: [] },
    museum: Museums.HYPERURANION,
    references: (dto.references ?? []).map(createCompactReference),
    uncuratedReferences: null,
    traditionalReferences: [],
    atf: '',
    hasPhoto: dto.hasPhoto,
    genres: Genres.fromJson(dto.genres ?? []),
    introduction: { text: '', parts: [] },
    script: createScript(dto.script),
    externalNumbers: {},
    projects: (dto.projects ?? []).map(createResearchProject),
    dossiers: dto.dossiers ?? [],
    date: dto.date ? MesopotamianDate.fromJson(dto.date) : undefined,
    datesInText: [],
    archaeology: dto.archaeology
      ? {
          excavationNumber: dto.archaeology.excavationNumber
            ? museumNumberToString(dto.archaeology.excavationNumber)
            : undefined,
          site: dto.archaeology.site
            ? {
                name: dto.archaeology.site.name,
                abbreviation: '',
                parent: null,
              }
            : undefined,
        }
      : undefined,
  })
}

function createQueryItem(dto: QueryResultItemDto): QueryItem {
  const queryItem = {
    museumNumber: museumNumberToString(dto.museumNumber),
    matchingLines: dto.matchingLines,
    matchCount: dto.matchCount,
  }

  if (isQuerySummaryItemDto(dto)) {
    return {
      ...queryItem,
      fragment: createQuerySummaryFragment(dto),
      cardSummary: {
        type: 'FragmentCardSummary',
        matchingLinePreview: dto.matchingLinePreview?.lines ?? [],
      },
      thumbnailPath: dto.thumbnailPath ?? null,
    }
  }

  if (isSummaryShapedDto(dto)) {
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
    items: dto.items.map(createQueryItem),
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
      const queryItem = createQueryItem(itemDto)
      const prefetchedFragment =
        queryItem.fragment ??
        fragmentsByMuseumNumber.get(queryItem.museumNumber)

      return prefetchedFragment
        ? { ...queryItem, fragment: prefetchedFragment }
        : queryItem
    }),
  }
}
