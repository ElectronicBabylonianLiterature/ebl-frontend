import FragmentRepository, {
  createScript,
} from 'fragmentarium/infrastructure/FragmentRepository'
import { fragmentDto } from 'test-support/test-fragment'
import { FragmentInfo, FragmentInfoDto } from 'fragmentarium/domain/fragment'
import { Genres } from 'fragmentarium/domain/Genres'

import Folio from 'fragmentarium/domain/Folio'
import { fragment } from 'test-support/test-fragment'
import { QueryResult } from 'query/QueryResult'
import { queryItemFactory } from 'test-support/query-item-factory'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import { Genre } from 'fragmentarium/domain/Genres'
import { mesopotamianDateFactory } from 'test-support/date-fixtures'
import { archaeologyFactory } from 'test-support/fragment-data-fixtures'

export const apiClient = {
  fetchJson: jest.fn(),
  postJson: jest.fn(),
  fetchBlob: jest.fn(),
}

export const fragmentRepository = new FragmentRepository(apiClient)

export const fragmentId = 'K 23+1234'

export const script = {
  period: 'Neo-Assyrian',
  periodModifier: 'None',
  uncertain: false,
}

export const fragmentInfo: FragmentInfo = {
  number: 'K.1',
  accession: 'A.1234',
  script: createScript(script),
  description: 'a fragment',
  matchingLines: null,
  editor: 'Editor',
  // eslint-disable-next-line camelcase
  edition_date: '2019-09-10T13:03:37.575580',
  references: [],
  genres: new Genres([]),
}

export const fragmentInfoDto: FragmentInfoDto = {
  ...fragmentInfo,
  script,
  accession: { prefix: 'A', number: '1234', suffix: '' },
}

export function createSummaryItemDto(
  overrides: Record<string, unknown>,
): Record<string, unknown> {
  return {
    museumNumber: fragmentDto.museumNumber,
    accession: fragmentDto.accession,
    description: fragmentDto.description,
    script: fragmentDto.script,
    date: fragmentDto.date,
    genres: fragmentDto.genres,
    archaeology: {
      excavationNumber: fragmentDto.museumNumber,
      site: { name: 'Sippar' },
    },
    references: fragmentDto.references,
    projects: fragmentDto.projects,
    dossiers: fragmentDto.dossiers,
    matchingLines: [1, 2],
    matchingLinePreview: fragmentDto.text,
    matchCount: 2,
    hasPhoto: true,
    thumbnailPath: null,
    ...overrides,
  }
}

export function mockQueryItems(
  items: readonly Record<string, unknown>[],
): void {
  apiClient.fetchJson.mockResolvedValueOnce({
    matchCountTotal: items.length,
    items,
  })
}

export const transliteration = 'transliteration'
export const notes = 'notes'
export const introduction = 'introduction'
export const lemmatization = [[{ value: 'kur', uniqueLemma: [] }]]
export const resultStub = {}
export const folio = new Folio({ name: 'MJG', number: 'K1' })
export const word = 'šim'
export const lemmas = 'foo I+bar II'
export const genres: Genre[] = [
  new Genre(['ARCHIVE', 'Letter'], false),
  new Genre(['CANONICAL', 'Divination'], true),
]
export const mesopotamianDate = mesopotamianDateFactory.build()
export const archaeology = archaeologyFactory.build()
export const museumNumber = { prefix: 'A', number: '7', suffix: '' }
export const queryResult: QueryResult = {
  items: [
    queryItemFactory.build({
      museumNumber: museumNumberToString(museumNumber),
    }),
  ],
  matchCountTotal: 2,
}
export const queryResultDto = {
  ...queryResult,
  items: queryResult.items.map((item) => ({
    ...item,
    museumNumber: museumNumber,
  })),
}

export const fragmentAfoRegisterQueryResult = {
  items: [
    {
      traditionalReference: fragment.traditionalReferences[0],
      fragmentNumbers: [fragment.number],
    },
  ],
}

export const references = [
  { id: 'RN52', type: 'DISCUSSION', pages: '', notes: '', linesCited: [] },
  { id: 'RN54', type: 'COPY', pages: '', notes: '', linesCited: [] },
]

export const lineToVecScore = {
  museumNumber: 'X.1',
  script: createScript(script),
  score: 1,
}

export const lineToVecScoreDto = { ...lineToVecScore, script: script }

export const lineToVecRanking = {
  score: [lineToVecScore],
  scoreWeighted: [lineToVecScore],
}

export const lineToVecRankingDto = {
  score: [lineToVecScoreDto],
  scoreWeighted: [lineToVecScoreDto],
}
