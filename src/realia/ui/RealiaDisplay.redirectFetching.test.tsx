import { screen } from '@testing-library/react'
import RealiaService from 'realia/application/RealiaService'
import RealiaRepository from 'realia/infrastructure/RealiaRepository'
import {
  renderRealiaRoute,
  waitForLocation,
} from 'realia/ui/RealiaDisplay.testSupport'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import { realiaEntryFactory } from 'test-support/realia-fixtures'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'

jest.mock('realia/infrastructure/RealiaRepository')

const lemma = 'Apkallu'
const realiaId = 'realia_000846'

const realiaRepository = new (RealiaRepository as jest.Mock)()

function mountAtUrl(url: string): jest.SpyInstance {
  const entry = realiaEntryFactory.build({ id: lemma, realiaId })
  realiaRepository.findByRealiaId.mockReturnValue(Promise.resolve(entry))
  realiaRepository.find.mockReturnValue(Promise.resolve(entry))
  const realiaService = new RealiaService(realiaRepository)
  const findSpy = jest.spyOn(realiaService, 'find')

  renderRealiaRoute(realiaService, url)

  return findSpy
}

beforeEach(() => {
  jest.clearAllMocks()
  installMockIntersectionObserver()
})

it('requests the entry only once across the canonicalising redirect', async () => {
  const findSpy = mountAtUrl(`/tools/realia/${realiaId}`)

  await waitForLocation(`/tools/realia/${lemma}`)

  expect(findSpy.mock.calls.map((call) => call[0])).toEqual([realiaId, lemma])
  expect(realiaRepository.findByRealiaId).toHaveBeenCalledTimes(1)
  expect(realiaRepository.find).not.toHaveBeenCalled()
})

it('requests the entry only once for a canonical lemma URL', async () => {
  const findSpy = mountAtUrl(`/tools/realia/${lemma}`)

  await waitForSpinnerToBeRemoved(screen)
  await waitForLocation(`/tools/realia/${lemma}`)

  expect(findSpy.mock.calls.map((call) => call[0])).toEqual([lemma])
  expect(realiaRepository.find).toHaveBeenCalledTimes(1)
  expect(realiaRepository.findByRealiaId).not.toHaveBeenCalled()
})
