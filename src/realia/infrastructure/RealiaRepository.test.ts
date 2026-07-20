import { testDelegation, TestData } from 'test-support/utils'
import RealiaRepository from 'realia/infrastructure/RealiaRepository'
import Promise from 'bluebird'
import { cslDataFactory } from 'test-support/bibliography-fixtures'
import {
  createRealiaRepositoryTestContext,
  entryDto,
  expectedEntry,
} from 'realia/infrastructure/realiaRepositoryTestData'

jest.mock('http/ApiClient')
const { apiClient, realiaRepository } = createRealiaRepositoryTestContext()

const testData: TestData<RealiaRepository>[] = [
  new TestData(
    'find',
    ['Pig'],
    apiClient.fetchJson,
    expectedEntry,
    ['/realia/Pig', false],
    Promise.resolve(entryDto),
  ),
  new TestData(
    'search',
    ['pig'],
    apiClient.fetchJson,
    [expectedEntry],
    ['/realia?query=pig', false],
    Promise.resolve([entryDto]),
  ),
  new TestData(
    'listAllRealia',
    [],
    apiClient.fetchJson,
    ['Pig'],
    ['/realia/all', false],
    Promise.resolve(['Pig']),
  ),
]

describe('RealiaRepository', () => testDelegation(realiaRepository, testData))

describe('RealiaRepository reallexikon mapping', () => {
  const rlaReferenceDto = {
    id: 'rla_1_3j',
    type: 'DISCUSSION' as const,
    pages: '3',
    notes: '',
    linesCited: [],
    document: cslDataFactory.build({}, { associations: { id: 'rla_1_3j' } }),
  }
  const otherReferenceDto = {
    id: 'De Zorzi 2016',
    type: 'DISCUSSION' as const,
    pages: '247',
    notes: '',
    linesCited: [],
    document: cslDataFactory.build(
      {},
      { associations: { id: 'De Zorzi 2016' } },
    ),
  }

  it('maps multiple reallexikon entries, each with its own embedded reference', async () => {
    const dto = {
      ...entryDto,
      reallexikon: [
        {
          id: 'lex1',
          title: 'Aššur A. Stadt',
          reference: rlaReferenceDto,
        },
        {
          id: 'lex2',
          title: 'Aššur B. Land',
          reference: null,
        },
      ],
      references: [otherReferenceDto],
    }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dto))
    const result = await realiaRepository.find('Pig')
    expect(result.reallexikon).toHaveLength(2)
    expect(result.reallexikon[0].title).toBe('Aššur A. Stadt')
    expect(result.reallexikon[0].reference?.pages).toBe('3')
    expect(result.reallexikon[1].title).toBe('Aššur B. Land')
    expect(result.reallexikon[1].reference).toBeNull()
  })

  it('keeps the top-level references separate from the reallexikon references', async () => {
    const dto = {
      ...entryDto,
      reallexikon: [
        {
          id: 'lex1',
          title: 'Title',
          reference: rlaReferenceDto,
        },
      ],
      references: [otherReferenceDto],
    }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dto))
    const result = await realiaRepository.find('Pig')
    expect(result.reallexikon[0].reference?.pages).toBe('3')
    expect(result.references).toHaveLength(1)
    expect(result.references[0].pages).toBe('247')
  })

  it('keeps an RlA reference in its entry and out of the top-level references', async () => {
    const dto = {
      ...entryDto,
      reallexikon: [
        {
          id: 'lex1',
          title: 'Title',
          reference: rlaReferenceDto,
        },
      ],
      references: [rlaReferenceDto, otherReferenceDto],
    }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dto))
    const result = await realiaRepository.find('Pig')
    expect(result.reallexikon[0].reference?.pages).toBe('3')
    expect(result.references).toHaveLength(1)
    expect(result.references[0].pages).toBe('247')
  })

  it('maps a reallexikon entry with a null reference', async () => {
    const dto = {
      ...entryDto,
      reallexikon: [
        {
          id: 'lex1',
          title: 'Title',
          reference: null,
        },
      ],
    }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dto))
    const result = await realiaRepository.find('Pig')
    expect(result.reallexikon[0].reference).toBeNull()
  })

  it('maps an empty reallexikon array', async () => {
    apiClient.fetchJson.mockReturnValueOnce(
      Promise.resolve({ ...entryDto, reallexikon: [] }),
    )
    const result = await realiaRepository.find('Pig')
    expect(result.reallexikon).toEqual([])
  })

  it('normalizes a null reallexikon to an empty array', async () => {
    apiClient.fetchJson.mockReturnValueOnce(
      Promise.resolve({ ...entryDto, reallexikon: null }),
    )
    const result = await realiaRepository.find('Pig')
    expect(result.reallexikon).toEqual([])
  })

  it('normalizes a single reallexikon object into a one-element array', async () => {
    const dto = {
      ...entryDto,
      reallexikon: {
        id: 'lex1',
        title: 'Title',
        reference: rlaReferenceDto,
      },
    }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dto))
    const result = await realiaRepository.find('Pig')
    expect(result.reallexikon).toHaveLength(1)
    expect(result.reallexikon[0].reference?.pages).toBe('3')
  })

  it('normalizes null collection fields to empty arrays', async () => {
    apiClient.fetchJson.mockReturnValueOnce(
      Promise.resolve({
        ...entryDto,
        relatedTerms: null,
        type: null,
        wikidataId: null,
        afoRegister: null,
        crossReferences: null,
        afoCrossReferences: null,
        references: null,
      }),
    )
    const result = await realiaRepository.find('Pig')
    expect(result.relatedTerms).toEqual([])
    expect(result.type).toEqual([])
    expect(result.wikidataId).toEqual([])
    expect(result.afoRegister).toEqual([])
    expect(result.crossReferences).toEqual([])
    expect(result.afoCrossReferences).toEqual([])
    expect(result.references).toEqual([])
  })
})

describe('RealiaRepository search query encoding', () => {
  it.each([
    ['pig & cow', '/realia?query=pig%20%26%20cow'],
    ['spaced query', '/realia?query=spaced%20query'],
    ['Ninĝirsu', '/realia?query=Nin%C4%9Dirsu'],
    ['?=#&/+', '/realia?query=%3F%3D%23%26%2F%2B'],
  ])(
    'sends the query %p url-encoded to preserve reserved characters',
    async (query, expectedUrl) => {
      apiClient.fetchJson.mockReturnValueOnce(Promise.resolve([]))
      await realiaRepository.search(query)
      expect(apiClient.fetchJson).toHaveBeenLastCalledWith(expectedUrl, false)
    },
  )
})
