import { testDelegation, TestData } from 'test-support/utils'
import RealiaRepository from 'realia/infrastructure/RealiaRepository'
import ApiClient from 'http/ApiClient'
import Promise from 'bluebird'
import { RealiaEntry } from 'realia/domain/RealiaEntry'
import { cslDataFactory } from 'test-support/bibliography-fixtures'

jest.mock('http/ApiClient')
const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()
const realiaRepository = new RealiaRepository(apiClient)

const entryDto = {
  _id: 'Pig',
  realiaId: 'realia_pig',
  relatedTerms: ['Schwein'],
  type: ['Objects'],
  wikidataId: ['Q787'],
  afoRegister: [
    {
      mainWord: 'Schwein',
      note: 'S.zucht',
      afoVolume: 'AfO 52',
      page: '645',
      AfO: 'AfO 52 (2018), 645',
      reference: '(2018) 645',
      crossReference: '',
      crossReferences: [],
    },
  ],
  reallexikon: [],
  crossReferences: [],
  afoCrossReferences: [],
  references: [],
}

const expectedEntry: RealiaEntry = {
  id: 'Pig',
  realiaId: 'realia_pig',
  relatedTerms: ['Schwein'],
  type: ['Objects'],
  wikidataId: ['Q787'],
  afoRegister: [
    {
      mainWord: 'Schwein',
      note: 'S.zucht',
      afoVolume: 'AfO 52',
      year: '2018',
      page: '645',
      AfO: 'AfO 52 (2018), 645',
      reference: '(2018) 645',
      crossReference: '',
      crossReferences: [],
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

  it('maps the stable realiaId verbatim', async () => {
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(entryDto))
    const result = await realiaRepository.find('realia_pig')
    expect(result.realiaId).toBe('realia_pig')
  })

  it('maps the structured AfO volume, page and resolved cross-references', async () => {
    const dto = {
      ...entryDto,
      afoRegister: [
        {
          mainWord: 'Adad',
          note: '',
          afoVolume: 'AfO 40/41',
          page: '420',
          AfO: 'AfO 40/41 (1993/1994), 420',
          reference: '',
          crossReference: 'Iškur',
          crossReferences: [{ id: 'realia_iskur', lemma: 'Iškur' }],
        },
      ],
    }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dto))
    const result = await realiaRepository.find('realia_pig')
    expect(result.afoRegister[0].afoVolume).toBe('AfO 40/41')
    expect(result.afoRegister[0].page).toBe('420')
    expect(result.afoRegister[0].crossReferences).toEqual([
      { id: 'realia_iskur', lemma: 'Iškur' },
    ])
  })

  it('normalizes a missing entry crossReferences to an empty array', async () => {
    const dto = {
      ...entryDto,
      afoRegister: [{ ...entryDto.afoRegister[0], crossReferences: null }],
    }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dto))
    const result = await realiaRepository.find('realia_pig')
    expect(result.afoRegister[0].crossReferences).toEqual([])
  })

  it('falls back to the document id when realiaId is missing', async () => {
    const dto = { ...entryDto, realiaId: undefined }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dto))
    const result = await realiaRepository.find('Pig')
    expect(result.realiaId).toBe('Pig')
  })

  it('derives afoVolume and page from the decorated AfO string when absent', async () => {
    const dto = {
      ...entryDto,
      afoRegister: [
        {
          mainWord: 'Adad',
          note: '',
          AfO: 'AfO 40/41 (1993/1994), 420',
          reference: '',
          crossReference: '',
        },
      ],
    }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dto))
    const result = await realiaRepository.find('Pig')
    expect(result.afoRegister[0].afoVolume).toBe('AfO 40/41')
    expect(result.afoRegister[0].year).toBe('1993/1994')
    expect(result.afoRegister[0].page).toBe('420')
  })

  it('derives the volume from an AfO string with a space-separated page', async () => {
    const dto = {
      ...entryDto,
      afoRegister: [
        {
          mainWord: 'Schwein',
          note: '',
          AfO: 'AfO 52 (2018) 645',
          reference: '',
          crossReference: '',
        },
      ],
    }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dto))
    const result = await realiaRepository.find('Pig')
    expect(result.afoRegister[0].afoVolume).toBe('AfO 52')
    expect(result.afoRegister[0].year).toBe('2018')
    expect(result.afoRegister[0].page).toBe('645')
  })

  it('derives an empty page from an AfO string that has none', async () => {
    const dto = {
      ...entryDto,
      afoRegister: [
        {
          mainWord: 'Adad',
          note: '',
          AfO: 'AfO 25',
          reference: '',
          crossReference: '',
        },
      ],
    }
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(dto))
    const result = await realiaRepository.find('Pig')
    expect(result.afoRegister[0].afoVolume).toBe('AfO 25')
    expect(result.afoRegister[0].year).toBe('')
    expect(result.afoRegister[0].page).toBe('')
  })
})
