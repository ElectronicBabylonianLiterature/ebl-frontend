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
  type: ['Objects'],
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
  crossReferences: [],
  afoCrossReferences: [],
  references: [],
}

const expectedEntry: RealiaEntry = {
  id: 'Pig',
  relatedTerms: ['Schwein'],
  type: ['Objects'],
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
  crossReferences: [],
  afoCrossReferences: [],
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
    pages: '247',
    notes: '',
    linesCited: [],
  }

  it('resolves each reallexikon reference id and moves it out of references', async () => {
    const dto = {
      ...entryDto,
      reallexikon: [
        {
          id: 'lex1',
          title: 'Title',
          content: 'content',
          reference: 'rla_1_3j',
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

  it('maps reallexikon entry with null reference', async () => {
    const dto = {
      ...entryDto,
      reallexikon: [
        {
          id: 'lex1',
          title: 'Title',
          content: 'content',
          reference: null,
        },
      ],
      references: [otherReferenceDto],
    }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dto))
    const result = await realiaRepository.find('Pig')
    expect(result.reallexikon[0].reference).toBeNull()
    expect(result.references).toHaveLength(1)
  })

  it('sets reference to null when the reference id is not found', async () => {
    const dto = {
      ...entryDto,
      reallexikon: [
        {
          id: 'lex1',
          title: 'Title',
          content: 'content',
          reference: 'missing',
        },
      ],
      references: [otherReferenceDto],
    }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dto))
    const result = await realiaRepository.find('Pig')
    expect(result.reallexikon[0].reference).toBeNull()
    expect(result.references).toHaveLength(1)
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
        content: 'content',
        reference: 'rla_1_3j',
      },
      references: [rlaReferenceDto, otherReferenceDto],
    }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dto))
    const result = await realiaRepository.find('Pig')
    expect(result.reallexikon).toHaveLength(1)
    expect(result.reallexikon[0].reference?.pages).toBe('3')
    expect(result.references).toHaveLength(1)
    expect(result.references[0].pages).toBe('247')
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

  it('maps the Reallexikon and AfO cross-references', async () => {
    const dto = {
      ...entryDto,
      crossReferences: [{ id: 'realia_1', lemma: 'Anu' }],
      afoCrossReferences: [{ id: 'realia_2', lemma: 'Enlil' }],
    }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dto))
    const result = await realiaRepository.find('Pig')
    expect(result.crossReferences).toEqual([{ id: 'realia_1', lemma: 'Anu' }])
    expect(result.afoCrossReferences).toEqual([
      { id: 'realia_2', lemma: 'Enlil' },
    ])
  })
})
