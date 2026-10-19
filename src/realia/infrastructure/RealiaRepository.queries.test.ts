import {
  createRealiaRepositoryTestContext,
  entryDto,
} from 'realia/infrastructure/realiaRepositoryTestData'

jest.mock('http/ApiClient')
const { apiClient, realiaRepository } = createRealiaRepositoryTestContext()

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
      expect(apiClient.fetchJson).toHaveBeenLastCalledWith(
        expectedUrl,
        false,
        undefined,
      )
    },
  )
})

describe('AfO citation parsing', () => {
  async function afoEntryFrom(afo: string) {
    const { afoVolume, page, ...rest } = entryDto.afoRegister[0]
    apiClient.fetchJson.mockReturnValueOnce(
      Promise.resolve({ ...entryDto, afoRegister: [{ ...rest, AfO: afo }] }),
    )
    return (await realiaRepository.find('Pig')).afoRegister[0]
  }

  it('splits a citation with a parenthesised year', async () => {
    expect(await afoEntryFrom('AfO 52 (2018), 645')).toMatchObject({
      afoVolume: 'AfO 52',
      year: '2018',
      page: '645',
    })
  })

  it('splits on the last comma when there is no year', async () => {
    expect(await afoEntryFrom('AfO 52, 645')).toMatchObject({
      afoVolume: 'AfO 52',
      year: '',
      page: '645',
    })
  })

  it('keeps the whole citation as the volume when it has neither', async () => {
    expect(await afoEntryFrom('AfO 52')).toMatchObject({
      afoVolume: 'AfO 52',
      year: '',
      page: '',
    })
  })
})
