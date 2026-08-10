import Promise from 'bluebird'
import {
  createJoins,
  createScript,
} from 'fragmentarium/infrastructure/FragmentRepository'
import { fragmentDto } from 'test-support/test-fragment'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import { PeriodModifiers, Periods } from 'common/utils/period'
import { ScriptDto } from 'fragmentarium/domain/fragment'
import {
  apiClient,
  fragmentId,
  fragmentInfoDto,
  fragmentRepository,
  museumNumber,
} from 'fragmentarium/infrastructure/fragmentRepository.testSupport'

describe('createFragment maps the optional structures it is given', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('builds the archaeology and the colophon when both are present', async () => {
    apiClient.fetchJson.mockReturnValueOnce(
      Promise.resolve({
        ...fragmentDto,
        archaeology: { excavationNumber: museumNumber },
        colophon: {},
      }),
    )

    const result = await fragmentRepository.find(fragmentId)

    expect(result.archaeology?.excavationNumber).toEqual(
      museumNumberToString(museumNumber),
    )
    expect(result.colophon).toBeDefined()
  })
})

describe('createFragmentInfo without an accession', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('leaves the accession empty', async () => {
    apiClient.fetchJson.mockReturnValueOnce(
      Promise.resolve([{ ...fragmentInfoDto, accession: null }]),
    )

    const [info] = await fragmentRepository.random()

    expect(info.accession).toEqual('')
  })
})

describe('createScript without a dto', () => {
  it('falls back to an uncertain, unmodified, certain script', () => {
    const result = createScript(undefined as unknown as ScriptDto)

    expect(result).toEqual({
      period: Periods.Uncertain,
      periodModifier: PeriodModifiers.None,
      uncertain: false,
    })
  })
})

describe('createJoins tolerates missing groups', () => {
  it('maps no joins at all', () => {
    expect(createJoins(undefined)).toEqual([])
  })

  it('maps a missing group as empty', () => {
    expect(createJoins([null])).toEqual([[]])
  })
})
