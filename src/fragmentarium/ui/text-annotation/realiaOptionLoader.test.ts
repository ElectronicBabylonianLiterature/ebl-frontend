import Bluebird from 'bluebird'
import {
  createRealiaOptionLoader,
  loadRealiaOptions,
  RealiaOption,
  toRealiaOption,
} from 'fragmentarium/ui/text-annotation/realiaOptionLoader'
import { realiaEntryFactory } from 'test-support/realia-fixtures'
import {
  mockRealiaSearch,
  realiaServiceMock,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'

jest.mock('realia/application/RealiaService')

const entry = realiaEntryFactory.build({
  id: 'Apkallu',
  realiaId: 'realia_000846',
})
const option = { value: 'realia_000846', label: 'Apkallu', entry }

const getContext = () => ({
  realiaService: realiaServiceMock,
  excludedRealiaIds: [] as readonly string[],
})

const flush = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0))

describe('toRealiaOption', () => {
  it('uses the realiaId as value and the lemma as label, keeping the entry', () => {
    expect(toRealiaOption(entry)).toEqual(option)
  })
})

describe('loadRealiaOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRealiaSearch([entry])
  })

  it('maps search results to options', async () => {
    await expect(loadRealiaOptions(realiaServiceMock, 'Apk')).resolves.toEqual([
      option,
    ])
    expect(realiaServiceMock.search).toHaveBeenCalledWith('Apk')
  })

  it('does not search on an empty query', async () => {
    await expect(loadRealiaOptions(realiaServiceMock, '')).resolves.toEqual([])
    expect(realiaServiceMock.search).not.toHaveBeenCalled()
  })

  it('omits realia that are already annotated on the span', async () => {
    await expect(
      loadRealiaOptions(realiaServiceMock, 'Apk', ['realia_000846']),
    ).resolves.toEqual([])
  })

  it('keeps realia that are not excluded', async () => {
    await expect(
      loadRealiaOptions(realiaServiceMock, 'Apk', ['realia_000999']),
    ).resolves.toEqual([option])
  })
})

describe('debouncing', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockRealiaSearch([entry])
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('debounces rapid queries into a single search of the latest input', () => {
    const load = createRealiaOptionLoader(getContext, 300)
    const callback = jest.fn()

    load('A', callback)
    load('Ap', callback)
    load('Apk', callback)
    expect(realiaServiceMock.search).not.toHaveBeenCalled()

    jest.advanceTimersByTime(300)

    expect(realiaServiceMock.search).toHaveBeenCalledTimes(1)
    expect(realiaServiceMock.search).toHaveBeenCalledWith('Apk')
  })

  it('returns empty and does not search on an empty query', () => {
    const load = createRealiaOptionLoader(getContext, 300)
    const callback = jest.fn<void, [RealiaOption[]]>()

    load('', callback)

    expect(callback).toHaveBeenCalledWith([])
    expect(realiaServiceMock.search).not.toHaveBeenCalled()
  })

  it('cancels a pending search', () => {
    const load = createRealiaOptionLoader(getContext, 300)

    load('Apk', jest.fn())
    load.cancel()
    jest.advanceTimersByTime(300)

    expect(realiaServiceMock.search).not.toHaveBeenCalled()
  })
})

describe('responses', () => {
  let callback: jest.Mock<void, [RealiaOption[]]>
  let load: ReturnType<typeof createRealiaOptionLoader>

  beforeEach(() => {
    jest.clearAllMocks()
    mockRealiaSearch([entry])
    callback = jest.fn<void, [RealiaOption[]]>()
    load = createRealiaOptionLoader(getContext, 0)
  })

  function pendingSearch(): (entries: readonly (typeof entry)[]) => void {
    let resolveSearch: (entries: readonly (typeof entry)[]) => void = () => {}
    realiaServiceMock.search.mockReturnValue(
      new Bluebird((resolve) => {
        resolveSearch = resolve
      }),
    )
    return (entries) => resolveSearch(entries)
  }

  it('responds with the mapped options', async () => {
    load('Apk', callback)
    await flush()

    expect(callback).toHaveBeenCalledWith([option])
  })

  it('responds with no options when the search rejects', async () => {
    realiaServiceMock.search.mockImplementation(() =>
      Bluebird.reject(new Error('Search failed.')),
    )

    load('Apk', callback)
    await flush()

    expect(callback).toHaveBeenCalledWith([])
  })

  it('ignores a superseded search that resolves last', async () => {
    const stale = realiaEntryFactory.build({ id: 'Stale', realiaId: 'r_1' })
    const resolveStale = pendingSearch()

    load('Sta', callback)
    await flush()
    mockRealiaSearch([entry])
    load('Apk', callback)
    await flush()

    resolveStale([stale])
    await flush()

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith([option])
  })

  it('ignores a request that resolves after the loader is cancelled', async () => {
    const resolveSearch = pendingSearch()

    load('Apk', callback)
    await flush()
    load.cancel()

    resolveSearch([entry])
    await flush()

    expect(callback).not.toHaveBeenCalled()
  })

  it('ignores a request superseded by clearing the query', async () => {
    const resolveSearch = pendingSearch()

    load('Apk', callback)
    await flush()
    load('', callback)

    resolveSearch([entry])
    await flush()

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith([])
  })
})
