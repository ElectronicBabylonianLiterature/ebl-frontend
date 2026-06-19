import { testDelegation, TestData } from 'test-support/utils'
import RealiaRepository from 'realia/infrastructure/RealiaRepository'
import ApiClient from 'http/ApiClient'
import Promise from 'bluebird'
import { RealiaEntry } from 'realia/domain/RealiaEntry'

jest.mock('http/ApiClient')
const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()
const realiaRepository = new RealiaRepository(apiClient)

const entryDto = {
  _id: 'Pig',
  relatedTerms: ['Schwein'],
  type: ['OBJECT_NAME'],
  wikidataId: ['Q787'],
  afoRegister: [
    {
      mainWord: 'Schwein',
      note: 'S.zucht',
      AfO: '52',
      reference: '(2018) 645',
      crossReference: '',
    },
  ],
  reallexikon: null,
  references: [],
}

const expectedEntry: RealiaEntry = {
  id: 'Pig',
  relatedTerms: ['Schwein'],
  type: ['OBJECT_NAME'],
  wikidataId: ['Q787'],
  afoRegister: [
    {
      mainWord: 'Schwein',
      note: 'S.zucht',
      AfO: '52',
      reference: '(2018) 645',
      crossReference: '',
    },
  ],
  reallexikon: null,
  references: [],
}

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
]

describe('RealiaRepository', () => testDelegation(realiaRepository, testData))

describe('RealiaRepository reallexikon mapping', () => {
  const rlaReferenceDto = {
    id: 'rla_1_3j',
    type: 'DISCUSSION' as const,
    pages: '3',
    notes: '',
    linesCited: [],
  }
  const otherReferenceDto = {
    id: 'De Zorzi 2016',
    type: 'DISCUSSION' as const,
    pages: '',
    notes: '',
    linesCited: [],
  }

  it('resolves the reallexikon reference id and moves it out of references', async () => {
    const dto = {
      ...entryDto,
      reallexikon: {
        id: 'lex1',
        title: 'Title',
        content: 'content',
        reference: 'rla_1_3j',
      },
      references: [rlaReferenceDto, otherReferenceDto],
    }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dto))
    const result = await realiaRepository.find('Pig')
    expect(result.reallexikon?.reference?.type).toBe('DISCUSSION')
    expect(result.references).toHaveLength(1)
    expect(result.references[0].type).toBe('DISCUSSION')
  })

  it('maps reallexikon entry with null reference', async () => {
    const dto = {
      ...entryDto,
      reallexikon: {
        id: 'lex1',
        title: 'Title',
        content: 'content',
        reference: null,
      },
      references: [otherReferenceDto],
    }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dto))
    const result = await realiaRepository.find('Pig')
    expect(result.reallexikon?.reference).toBeNull()
    expect(result.references).toHaveLength(1)
  })

  it('sets reference to null when the reference id is not found', async () => {
    const dto = {
      ...entryDto,
      reallexikon: {
        id: 'lex1',
        title: 'Title',
        content: 'content',
        reference: 'missing',
      },
      references: [otherReferenceDto],
    }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dto))
    const result = await realiaRepository.find('Pig')
    expect(result.reallexikon?.reference).toBeNull()
    expect(result.references).toHaveLength(1)
  })

  it('maps a null reallexikon to null', async () => {
    apiClient.fetchJson.mockReturnValueOnce(
      Promise.resolve({ ...entryDto, reallexikon: null }),
    )
    const result = await realiaRepository.find('Pig')
    expect(result.reallexikon).toBeNull()
  })
})
