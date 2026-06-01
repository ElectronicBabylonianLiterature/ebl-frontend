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
  reallexikon: [],
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
  reallexikon: [],
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
  it('maps reallexikon entry with non-null reference', async () => {
    const referenceDto = {
      id: 'ref1',
      type: 'DISCUSSION' as const,
      pages: '1-5',
      notes: '',
      linesCited: [],
    }
    const dtoWithReference = {
      ...entryDto,
      reallexikon: [
        {
          id: 'lex1',
          title: 'Title',
          content: 'content',
          reference: referenceDto,
        },
      ],
    }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dtoWithReference))
    const result = await realiaRepository.find('Pig')
    expect(result.reallexikon[0].reference).not.toBeNull()
    expect(result.reallexikon[0].reference?.type).toBe('DISCUSSION')
  })

  it('maps reallexikon entry with null reference', async () => {
    const dtoWithNullReference = {
      ...entryDto,
      reallexikon: [
        {
          id: 'lex1',
          title: 'Title',
          content: 'content',
          reference: null,
        },
      ],
    }
    apiClient.fetchJson.mockReturnValueOnce(
      Promise.resolve(dtoWithNullReference),
    )
    const result = await realiaRepository.find('Pig')
    expect(result.reallexikon[0].reference).toBeNull()
  })
})
