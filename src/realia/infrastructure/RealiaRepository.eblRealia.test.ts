import {
  createRealiaRepositoryTestContext,
  entryDto,
} from 'realia/infrastructure/realiaRepositoryTestData'
import {
  etaPisciumDto,
  jonesReferenceDto,
  lisinDto,
} from 'test-support/realia-ebl-fixtures'

jest.mock('http/ApiClient')
const { apiClient, realiaRepository } = createRealiaRepositoryTestContext()

describe('RealiaRepository eBL Realia mapping', () => {
  it('maps the eBL entry and the reference types of a star', async () => {
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(etaPisciumDto))
    const result = await realiaRepository.findByRealiaId('realia_028434')
    expect(result.referenceType).toEqual(['eBL'])
    expect(result.eblRealia).toHaveLength(1)
    const [eblEntry] = result.eblRealia
    expect(eblEntry).toMatchObject({
      id: 'MÚL KUR šá DUR nu-nu',
      transliteration: 'MÚL KUR šá DUR nu-nu',
      translation: 'The bright star of the ribbon of the fishes',
      identification: 'η Psc',
      pos: 'CN',
      wikidataId: ['Q14068'],
      remarks: '',
    })
    expect(eblEntry.reference?.id).toBe('jones2004study')
    expect(eblEntry.reference?.pages).toBe('482')
    expect(eblEntry.reference?.primaryAuthor).toBe('Jones')
  })

  it('keeps an eBL reference out of the top-level references', async () => {
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(etaPisciumDto))
    const result = await realiaRepository.findByRealiaId('realia_028434')
    expect(result.references).toEqual([])
  })

  it('hydrates an eBL reference without a document from the top-level references', async () => {
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(lisinDto))
    const result = await realiaRepository.findByRealiaId('realia_009307')
    const reference = result.eblRealia[0].reference
    expect(reference?.type).toBe('DISCUSSION')
    expect(reference?.pages).toBe('482')
    expect(reference?.primaryAuthor).toBe('Jones')
    expect(result.referenceType).toEqual(['RlA', 'AfO', 'eBL'])
  })

  it('fills absent eBL fields with empty values', async () => {
    apiClient.fetchJson.mockReturnValueOnce(
      Promise.resolve({
        ...entryDto,
        eblRealia: [{ id: 'SI₄' }],
        references: [jonesReferenceDto],
      }),
    )
    const result = await realiaRepository.find('Pig')
    expect(result.eblRealia).toEqual([
      {
        id: 'SI₄',
        transliteration: '',
        normalisation: '',
        translation: '',
        identification: '',
        pos: '',
        wikidataId: [],
        reference: null,
        remarks: '',
      },
    ])
    expect(result.references).toHaveLength(1)
  })

  it('drops unknown reference types', async () => {
    apiClient.fetchJson.mockReturnValueOnce(
      Promise.resolve({ ...entryDto, referenceType: ['AfO', 'Other'] }),
    )
    const result = await realiaRepository.find('Pig')
    expect(result.referenceType).toEqual(['AfO'])
  })

  it('loads a document without the new fields as empty lists', async () => {
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(entryDto))
    const result = await realiaRepository.find('Pig')
    expect(result.referenceType).toEqual([])
    expect(result.eblRealia).toEqual([])
  })
})
