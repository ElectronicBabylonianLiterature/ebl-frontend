import {
  createRealiaRepositoryTestContext,
  entryDto,
} from 'realia/infrastructure/realiaRepositoryTestData'
import Promise from 'bluebird'

jest.mock('http/ApiClient')
const { apiClient, realiaRepository } = createRealiaRepositoryTestContext()

describe('RealiaRepository AfO and cross-reference mapping', () => {
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
