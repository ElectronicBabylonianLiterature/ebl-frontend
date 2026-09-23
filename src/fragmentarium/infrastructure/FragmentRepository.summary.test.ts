import {
  createSummaryItemDto,
  fragmentRepository,
  mockQueryItems,
} from 'fragmentarium/infrastructure/fragmentRepository.testSupport'

describe('FragmentRepository query summary without optional data', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('defaults every optional collection of a summary item', async () => {
    mockQueryItems([
      createSummaryItemDto({
        references: undefined,
        genres: undefined,
        projects: undefined,
        dossiers: undefined,
        date: null,
        archaeology: undefined,
      }),
    ])

    const { fragment } = (await fragmentRepository.query({ lemmas: 'kur' }))
      .items[0]

    expect(fragment?.references).toEqual([])
    expect(fragment?.genres.genres).toEqual([])
    expect(fragment?.projects).toEqual([])
    expect(fragment?.dossiers).toEqual([])
    expect(fragment?.date).toBeUndefined()
    expect(fragment?.archaeology).toBeUndefined()
  })

  it('keeps an archaeology without an excavation number or site', async () => {
    mockQueryItems([
      createSummaryItemDto({
        archaeology: { excavationNumber: undefined, site: undefined },
      }),
    ])

    const { fragment } = (await fragmentRepository.query({ lemmas: 'kur' }))
      .items[0]

    expect(fragment?.archaeology).toEqual({
      excavationNumber: undefined,
      site: undefined,
    })
  })
})
