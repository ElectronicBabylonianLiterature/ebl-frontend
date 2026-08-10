import Promise from 'bluebird'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'
import { Fragment } from 'fragmentarium/domain/fragment'
import { QueryResult } from 'query/QueryResult'
import {
  createScopedService,
  fragmentRepository,
  imageRepository,
  number,
  query,
  setupCacheTest,
} from 'fragmentarium/application/fragmentServiceCache.testSupport'

let cachedFragment: Fragment
let updatedFragment: Fragment
let queryResult: QueryResult
let updatedQueryResult: QueryResult

beforeEach(() => {
  ;({ cachedFragment, updatedFragment, queryResult, updatedQueryResult } =
    setupCacheTest())
})

describe('cache scope changes', () => {
  test('clears cached fragment values when cache scope changes', async () => {
    let cacheScope = 'guest'
    const scopedService = createScopedService(() => cacheScope)
    fragmentRepository.find
      .mockReturnValueOnce(Promise.resolve(cachedFragment))
      .mockReturnValueOnce(Promise.resolve(updatedFragment))

    await expect(scopedService.find(number)).resolves.toMatchObject({
      number: cachedFragment.number,
    })
    await expect(scopedService.find(number)).resolves.toMatchObject({
      number: cachedFragment.number,
    })

    cacheScope = 'authenticated:user'
    await expect(scopedService.find(number)).resolves.toMatchObject({
      number: updatedFragment.number,
    })

    expect(fragmentRepository.find).toHaveBeenCalledTimes(2)
  })

  test('uses default cache scope when cache scope resolver throws', async () => {
    const scopedService = createScopedService(() => {
      throw new Error('scope resolver failed')
    })
    fragmentRepository.find.mockReturnValue(Promise.resolve(cachedFragment))

    await expect(scopedService.find(number)).resolves.toMatchObject({
      number: cachedFragment.number,
    })
    await expect(scopedService.find(number)).resolves.toMatchObject({
      number: cachedFragment.number,
    })

    expect(fragmentRepository.find).toHaveBeenCalledTimes(1)
  })

  test('clears cached thumbnail values across auth transitions', async () => {
    let cacheScope = 'guest'
    const scopedService = createScopedService(() => cacheScope)
    const guestThumbnail = { blob: new Blob(['guest']) }
    const userAThumbnail = { blob: new Blob(['user-a']) }
    const userBThumbnail = { blob: new Blob(['user-b']) }
    const guestThumbnailAfterLogout = { blob: new Blob(['guest-after']) }

    imageRepository.findThumbnail
      .mockReturnValueOnce(Promise.resolve(guestThumbnail))
      .mockReturnValueOnce(Promise.resolve(userAThumbnail))
      .mockReturnValueOnce(Promise.resolve(userBThumbnail))
      .mockReturnValueOnce(Promise.resolve(guestThumbnailAfterLogout))

    await expect(
      scopedService.findThumbnail(cachedFragment, 'small'),
    ).resolves.toBe(guestThumbnail)
    await expect(
      scopedService.findThumbnail(cachedFragment, 'small'),
    ).resolves.toBe(guestThumbnail)

    cacheScope = 'authenticated:user-a'
    await expect(
      scopedService.findThumbnail(cachedFragment, 'small'),
    ).resolves.toBe(userAThumbnail)

    cacheScope = 'authenticated:user-b'
    await expect(
      scopedService.findThumbnail(cachedFragment, 'small'),
    ).resolves.toBe(userBThumbnail)

    cacheScope = 'guest'
    await expect(
      scopedService.findThumbnail(cachedFragment, 'small'),
    ).resolves.toBe(guestThumbnailAfterLogout)

    expect(imageRepository.findThumbnail).toHaveBeenCalledTimes(4)
  })

  test('clears cached provenance values across auth transitions', async () => {
    let cacheScope = 'guest'
    const scopedService = createScopedService(() => cacheScope)
    const guestProvenances: readonly ProvenanceRecord[] = [
      {
        id: 'guest-site',
        longName: 'Guest Site',
        abbreviation: 'GS',
        parent: 'Guest',
        sortKey: 1,
      },
    ]
    const userAProvenances: readonly ProvenanceRecord[] = [
      {
        id: 'user-a-site',
        longName: 'User A Site',
        abbreviation: 'UA',
        parent: 'User A',
        sortKey: 1,
      },
    ]
    const userBProvenances: readonly ProvenanceRecord[] = [
      {
        id: 'user-b-site',
        longName: 'User B Site',
        abbreviation: 'UB',
        parent: 'User B',
        sortKey: 1,
      },
    ]
    const guestProvenancesAfterLogout: readonly ProvenanceRecord[] = [
      {
        id: 'guest-site-after',
        longName: 'Guest Site After',
        abbreviation: 'GSA',
        parent: 'Guest',
        sortKey: 1,
      },
    ]

    fragmentRepository.fetchProvenances
      .mockReturnValueOnce(Promise.resolve(guestProvenances))
      .mockReturnValueOnce(Promise.resolve(userAProvenances))
      .mockReturnValueOnce(Promise.resolve(userBProvenances))
      .mockReturnValueOnce(Promise.resolve(guestProvenancesAfterLogout))

    await expect(scopedService.fetchProvenances()).resolves.toEqual(
      guestProvenances,
    )
    await expect(scopedService.fetchProvenances()).resolves.toEqual(
      guestProvenances,
    )

    cacheScope = 'authenticated:user-a'
    await expect(scopedService.fetchProvenances()).resolves.toEqual(
      userAProvenances,
    )

    cacheScope = 'authenticated:user-b'
    await expect(scopedService.fetchProvenances()).resolves.toEqual(
      userBProvenances,
    )

    cacheScope = 'guest'
    await expect(scopedService.fetchProvenances()).resolves.toEqual(
      guestProvenancesAfterLogout,
    )

    expect(fragmentRepository.fetchProvenances).toHaveBeenCalledTimes(4)
  })

  test('clears in-flight query requests when scope changes from guest to authenticated', async () => {
    let cacheScope = 'guest'
    const scopedService = createScopedService(() => cacheScope)
    let resolveGuestQuery: (value: QueryResult) => void = () => undefined
    const guestQuery = new Promise<QueryResult>((resolve) => {
      resolveGuestQuery = resolve
    })

    fragmentRepository.query
      .mockReturnValueOnce(guestQuery)
      .mockReturnValueOnce(Promise.resolve(updatedQueryResult))

    const guestInFlight = scopedService.query(query)

    cacheScope = 'authenticated:user-a'
    await expect(scopedService.query(query)).resolves.toEqual(
      updatedQueryResult,
    )

    resolveGuestQuery(queryResult)
    await expect(guestInFlight).resolves.toEqual(queryResult)

    expect(fragmentRepository.query).toHaveBeenCalledTimes(2)
  })

  test('clears in-flight latest query requests across auth transitions', async () => {
    let cacheScope = 'guest'
    const scopedService = createScopedService(() => cacheScope)
    let resolveGuestQuery: (value: QueryResult) => void = () => undefined
    let resolveUserAQuery: (value: QueryResult) => void = () => undefined
    let resolveUserBQuery: (value: QueryResult) => void = () => undefined
    const guestQuery = new Promise<QueryResult>((resolve) => {
      resolveGuestQuery = resolve
    })
    const userAQuery = new Promise<QueryResult>((resolve) => {
      resolveUserAQuery = resolve
    })
    const userBQuery = new Promise<QueryResult>((resolve) => {
      resolveUserBQuery = resolve
    })

    fragmentRepository.queryLatest
      .mockReturnValueOnce(guestQuery)
      .mockReturnValueOnce(userAQuery)
      .mockReturnValueOnce(userBQuery)
      .mockReturnValueOnce(Promise.resolve(updatedQueryResult))

    const guestInFlight = scopedService.queryLatest()

    cacheScope = 'authenticated:user-a'
    const userAInFlight = scopedService.queryLatest()

    cacheScope = 'authenticated:user-b'
    const userBInFlight = scopedService.queryLatest()

    cacheScope = 'guest'
    await expect(scopedService.queryLatest()).resolves.toEqual(
      updatedQueryResult,
    )

    resolveGuestQuery(queryResult)
    resolveUserAQuery(queryResult)
    resolveUserBQuery(queryResult)

    await expect(guestInFlight).resolves.toEqual(queryResult)
    await expect(userAInFlight).resolves.toEqual(queryResult)
    await expect(userBInFlight).resolves.toEqual(queryResult)

    expect(fragmentRepository.queryLatest).toHaveBeenCalledTimes(4)
  })
})
