import FragmentRepository, {
  createScript,
} from 'fragmentarium/infrastructure/FragmentRepository'
import { fragmentDto } from 'test-support/test-fragment'
import { FragmentInfo, FragmentInfoDto } from 'fragmentarium/domain/fragment'
import { Genres } from 'fragmentarium/domain/Genres'

export const apiClient = {
  fetchJson: jest.fn(),
  postJson: jest.fn(),
  fetchBlob: jest.fn(),
}

export const fragmentRepository = new FragmentRepository(apiClient)

export const fragmentId = 'K 23+1234'

export const museumNumber = { prefix: 'A', number: '7', suffix: '' }

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
